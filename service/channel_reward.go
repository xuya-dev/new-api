package service

import (
	"fmt"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/operation_setting"
)

var channelRewardOnce sync.Once

func StartChannelRewardSettlement() {
	if !common.IsMasterNode {
		return
	}
	channelRewardOnce.Do(func() {
		go func() {
			time.Sleep(5 * time.Minute)
			settleOnlineRewards()
			for {
				time.Sleep(1 * time.Hour)
				settleOnlineRewards()
			}
		}()
	})
}

func settleOnlineRewards() {
	setting := operation_setting.GetChannelRewardSetting()
	if !setting.Enabled {
		return
	}

	common.SysLog("channel online reward settlement started")

	cleanBefore := common.GetTimestamp() - 7*24*3600
	if err := model.CleanOldUptimeLogs(cleanBefore); err != nil {
		common.SysLog(fmt.Sprintf("failed to clean old uptime logs: %s", err.Error()))
	}

	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		common.SysLog(fmt.Sprintf("failed to get channels for reward settlement: %s", err.Error()))
		return
	}

	rootUser := model.GetRootUser()

	now := common.GetTimestamp()
	sinceTime := now - 3600

	for _, channel := range channels {
		if channel.Status != common.ChannelStatusEnabled {
			continue
		}

		total, success, avgResponseTime, err := model.GetChannelUptimeStats(channel.Id, sinceTime)
		if err != nil || total == 0 {
			continue
		}

		uptimeRate := float64(success) / float64(total)
		if uptimeRate < setting.MinUptimeRate {
			continue
		}

		onlineReward := int(float64(setting.OnlinePerHour) * uptimeRate)
		if onlineReward <= 0 {
			continue
		}

		rewardUserId := channel.UserId
		if rewardUserId <= 0 && rootUser != nil {
			rewardUserId = rootUser.Id
		}
		if rewardUserId <= 0 {
			continue
		}

		_ = model.RecordRewardLog(&model.ChannelRewardLog{
			UserId:    rewardUserId,
			ChannelId: channel.Id,
			Type:      model.RewardTypeOnline,
			Quota:     onlineReward,
			Detail:    fmt.Sprintf("%.0f%%", uptimeRate*100),
			CreatedAt: now,
		})

		err = model.IncreaseUserQuota(rewardUserId, onlineReward, false)
		if err != nil {
			common.SysLog(fmt.Sprintf("failed to increase user quota: user_id=%d, error=%s", rewardUserId, err.Error()))
		} else {
			common.SysLog(fmt.Sprintf("channel online reward granted: channel_id=%d, user_id=%d, quota=%d, uptime_rate=%.2f%%, avg_response_time=%.0fms",
				channel.Id, rewardUserId, onlineReward, uptimeRate*100, avgResponseTime))
		}
	}

	common.SysLog("channel online reward settlement finished")
}
