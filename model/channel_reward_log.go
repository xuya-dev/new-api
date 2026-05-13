package model

import (
	"fmt"
	"sync/atomic"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

type ChannelRewardSummary struct {
	ChannelId int `json:"channel_id"`
	TotalQuota int64 `json:"total_quota"`
}

const (
	RewardTypeOnline       = 1 // 渠道在线奖励
	RewardTypeUsage        = 2 // 渠道使用返利
	RewardTypeCheckin      = 3 // 签到奖励
	RewardTypeInvitee      = 4 // 邀请奖励 - 被邀请人
	RewardTypeInviter      = 5 // 邀请奖励 - 邀请人
	RewardTypeRegistration = 6 // 注册赠送
)

type ChannelRewardLog struct {
	Id        int    `json:"id" gorm:"primaryKey"`
	UserId    int    `json:"user_id" gorm:"index"`
	ChannelId int    `json:"channel_id" gorm:"index"`
	Type      int    `json:"type"`
	Quota     int    `json:"quota"`
	Detail    string `json:"detail"`
	CreatedAt int64  `json:"created_at" gorm:"bigint"`
}

type RewardLogWithUser struct {
	*ChannelRewardLog
	Username           string `json:"username"`
	ChannelName        string `json:"channel_name"`
	ConsumedChannelId  int    `json:"consumed_channel_id"`
	ConsumedChannelName string `json:"consumed_channel_name"`
}

func GetChannelNameById(channelId int) (string, error) {
	var name string
	err := DB.Model(&Channel{}).Where("id = ?", channelId).Select("name").Limit(1).Row().Scan(&name)
	return name, err
}

func RecordRewardLog(log *ChannelRewardLog) error {
	return DB.Create(log).Error
}

func GetRewardLogsByUser(userId int, logType int, channelId int, startTimestamp int64, endTimestamp int64, startIdx int, pageSize int) ([]*ChannelRewardLog, int64, error) {
	var logs []*ChannelRewardLog
	var total int64
	query := DB.Model(&ChannelRewardLog{}).Where("user_id = ?", userId)
	if logType > 0 {
		query = query.Where("type = ?", logType)
	}
	if channelId > 0 {
		query = query.Where("channel_id = ?", channelId)
	}
	if startTimestamp > 0 {
		query = query.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp > 0 {
		query = query.Where("created_at <= ?", endTimestamp)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := query.Order("id desc").Offset(startIdx).Limit(pageSize).Find(&logs).Error
	return logs, total, err
}

func FindUserIdsByUsername(username string) ([]int, error) {
	var ids []int
	err := DB.Model(&User{}).Where("username LIKE ?", "%"+username+"%").Pluck("id", &ids).Error
	return ids, err
}

func GetAllRewardLogs(logType int, channelId int, userIds []int, startTimestamp int64, endTimestamp int64, startIdx int, pageSize int) ([]*ChannelRewardLog, int64, error) {
	var logs []*ChannelRewardLog
	var total int64
	query := DB.Model(&ChannelRewardLog{})
	if logType > 0 {
		query = query.Where("type = ?", logType)
	}
	if channelId > 0 {
		query = query.Where("channel_id = ?", channelId)
	}
	if len(userIds) > 0 {
		query = query.Where("user_id IN ?", userIds)
	}
	if startTimestamp > 0 {
		query = query.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp > 0 {
		query = query.Where("created_at <= ?", endTimestamp)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := query.Order("id desc").Offset(startIdx).Limit(pageSize).Find(&logs).Error
	return logs, total, err
}

func GetChannelUserId(channelId int) (int, error) {
	var channel Channel
	if err := DB.Select("user_id").Where("id = ?", channelId).First(&channel).Error; err != nil {
		return 0, err
	}
	return channel.UserId, nil
}

var usageBonusRoundRobin uint64

func GetGroupModelChannelIds(group string, modelName string) []int {
	if !common.MemoryCacheEnabled {
		var ids []int
		err := DB.Model(&Ability{}).
			Where(commonGroupCol+" = ? AND model = ? AND enabled = ?", group, modelName, true).
			Pluck("channel_id", &ids).Error
		if err != nil {
			return nil
		}
		return ids
	}

	channelSyncLock.RLock()
	defer channelSyncLock.RUnlock()

	channels := group2model2channels[group][modelName]
	if len(channels) == 0 {
		normalizedModel := ratio_setting.FormatMatchingModelName(modelName)
		channels = group2model2channels[group][normalizedModel]
	}
	if len(channels) == 0 {
		return nil
	}

	enabled := make([]int, 0, len(channels))
	for _, id := range channels {
		if ch, ok := channelsIDM[id]; ok && ch.Status == common.ChannelStatusEnabled {
			enabled = append(enabled, id)
		}
	}
	return enabled
}

func GrantUsageBonus(channelId int, consumedQuota int, bonusRate float64, group string, modelName string) {
	if bonusRate <= 0 || consumedQuota <= 0 {
		return
	}

	targetChannelId := channelId
	if group != "" && modelName != "" {
		ids := GetGroupModelChannelIds(group, modelName)
		if len(ids) > 0 {
			idx := atomic.AddUint64(&usageBonusRoundRobin, 1)
			targetChannelId = ids[idx%uint64(len(ids))]
		}
	}

	userId, err := GetChannelUserId(targetChannelId)
	if err != nil {
		return
	}
	if userId <= 0 {
		rootUser := GetRootUser()
		if rootUser == nil {
			return
		}
		userId = rootUser.Id
	}
	bonus := int(float64(consumedQuota) * bonusRate)
	if bonus <= 0 {
		return
	}
	if err := IncreaseUserQuota(userId, bonus, false); err != nil {
		common.SysLog(fmt.Sprintf("failed to grant usage bonus: channel_id=%d, error=%s", targetChannelId, err.Error()))
		return
	}
	_ = RecordRewardLog(&ChannelRewardLog{
		UserId:    userId,
		ChannelId: targetChannelId,
		Type:      RewardTypeUsage,
		Quota:     bonus,
		Detail:    fmt.Sprintf("%d", channelId),
		CreatedAt: common.GetTimestamp(),
	})
}

type RewardLogStats struct {
	TotalQuota int64 `json:"total_quota"`
	TotalCount int64 `json:"total_count"`
}

func GetRewardLogStats(userId int, logType int, channelId int, startTimestamp int64, endTimestamp int64) (*RewardLogStats, error) {
	var stats RewardLogStats
	query := DB.Model(&ChannelRewardLog{})
	if userId > 0 {
		query = query.Where("user_id = ?", userId)
	}
	if logType > 0 {
		query = query.Where("type = ?", logType)
	}
	if channelId > 0 {
		query = query.Where("channel_id = ?", channelId)
	}
	if startTimestamp > 0 {
		query = query.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp > 0 {
		query = query.Where("created_at <= ?", endTimestamp)
	}
	err := query.Select("COALESCE(SUM(quota), 0) as total_quota, COUNT(*) as total_count").Scan(&stats).Error
	return &stats, err
}

func GetRewardSummaryByUser(userId int) ([]*ChannelRewardSummary, error) {
	var results []*ChannelRewardSummary
	err := DB.Model(&ChannelRewardLog{}).
		Select("channel_id, SUM(quota) as total_quota").
		Where("user_id = ?", userId).
		Group("channel_id").
		Find(&results).Error
	return results, err
}
