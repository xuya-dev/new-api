package service

import (
	"fmt"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

var channelRewardOnce sync.Once

const (
	rewardSettlementIntervalHours = 24
	baseOnlineRewardPerHour       = 100
	minUptimeRateForReward        = 0.5
)

func StartChannelRewardSettlement() {
	if !common.IsMasterNode {
		return
	}
	channelRewardOnce.Do(func() {
		go func() {
			time.Sleep(5 * time.Minute)
			settleChannelRewards()
			for {
				time.Sleep(time.Duration(rewardSettlementIntervalHours) * time.Hour)
				settleChannelRewards()
			}
		}()
	})
}

func settleChannelRewards() {
	common.SysLog("channel reward settlement started")

	// Clean uptime logs older than 7 days
	cleanBefore := common.GetTimestamp() - 7*24*3600
	if err := model.CleanOldUptimeLogs(cleanBefore); err != nil {
		common.SysLog(fmt.Sprintf("failed to clean old uptime logs: %s", err.Error()))
	}

	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		common.SysLog(fmt.Sprintf("failed to get channels for reward settlement: %s", err.Error()))
		return
	}

	now := common.GetTimestamp()
	sinceTime := now - rewardSettlementIntervalHours*3600

	for _, channel := range channels {
		if channel.UserId <= 0 {
			continue
		}
		if channel.Status != common.ChannelStatusEnabled {
			continue
		}

		total, success, avgResponseTime, err := model.GetChannelUptimeStats(channel.Id, sinceTime)
		if err != nil || total == 0 {
			continue
		}

		uptimeRate := float64(success) / float64(total)
		if uptimeRate < minUptimeRateForReward {
			continue
		}

		uptimeHours := float64(rewardSettlementIntervalHours) * uptimeRate
		onlineReward := int(uptimeHours * baseOnlineRewardPerHour)

		lastReward, _ := model.GetChannelLastReward(channel.Id)
		var usageDelta int64
		if lastReward != nil {
			usageDelta = channel.UsedQuota - lastReward.UsageCount
			if usageDelta < 0 {
				usageDelta = 0
			}
		} else {
			usageDelta = channel.UsedQuota
		}
		usageBonus := int(float64(usageDelta) * 0.01)

		totalReward := onlineReward + usageBonus
		if totalReward <= 0 {
			continue
		}

		reward := &model.ChannelReward{
			UserId:      channel.UserId,
			ChannelId:   channel.Id,
			Quota:       totalReward,
			UptimeHours: uptimeHours,
			UsageCount:  channel.UsedQuota,
			CreatedAt:   now,
		}
		if err := model.RecordChannelReward(reward); err != nil {
			common.SysLog(fmt.Sprintf("failed to record channel reward: channel_id=%d, error=%s", channel.Id, err.Error()))
			continue
		}

		err = model.IncreaseUserQuota(channel.UserId, totalReward, false)
		if err != nil {
			common.SysLog(fmt.Sprintf("failed to increase user quota: user_id=%d, error=%s", channel.UserId, err.Error()))
		} else {
			common.SysLog(fmt.Sprintf("channel reward granted: channel_id=%d, user_id=%d, quota=%d, uptime_rate=%.2f%%, avg_response_time=%.0fms",
				channel.Id, channel.UserId, totalReward, uptimeRate*100, avgResponseTime))
		}
	}

	common.SysLog("channel reward settlement finished")
}
