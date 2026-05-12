package model

import (
	"fmt"

	"github.com/QuantumNous/new-api/common"
)

const (
	RewardTypeOnline  = 1
	RewardTypeUsage   = 2
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

func RecordRewardLog(log *ChannelRewardLog) error {
	return DB.Create(log).Error
}

func GetRewardLogsByUser(userId int, logType int, startIdx int, pageSize int) ([]*ChannelRewardLog, int64, error) {
	var logs []*ChannelRewardLog
	var total int64
	query := DB.Model(&ChannelRewardLog{}).Where("user_id = ?", userId)
	if logType > 0 {
		query = query.Where("type = ?", logType)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := query.Order("id desc").Offset(startIdx).Limit(pageSize).Find(&logs).Error
	return logs, total, err
}

func GetAllRewardLogs(logType int, channelId int, startIdx int, pageSize int) ([]*ChannelRewardLog, int64, error) {
	var logs []*ChannelRewardLog
	var total int64
	query := DB.Model(&ChannelRewardLog{})
	if logType > 0 {
		query = query.Where("type = ?", logType)
	}
	if channelId > 0 {
		query = query.Where("channel_id = ?", channelId)
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

func GrantUsageBonus(channelId int, consumedQuota int, bonusRate float64) {
	if bonusRate <= 0 || consumedQuota <= 0 {
		return
	}
	userId, err := GetChannelUserId(channelId)
	if err != nil || userId <= 0 {
		return
	}
	bonus := int(float64(consumedQuota) * bonusRate)
	if bonus <= 0 {
		return
	}
	if err := IncreaseUserQuota(userId, bonus, false); err != nil {
		common.SysLog(fmt.Sprintf("failed to grant usage bonus: channel_id=%d, error=%s", channelId, err.Error()))
		return
	}
	_ = RecordRewardLog(&ChannelRewardLog{
		UserId:    userId,
		ChannelId: channelId,
		Type:      RewardTypeUsage,
		Quota:     bonus,
	Detail:    fmt.Sprintf("%d", channelId),
	CreatedAt: common.GetTimestamp(),
	})
}
