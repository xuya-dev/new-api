package model

type ChannelReward struct {
	Id          int     `json:"id" gorm:"primaryKey"`
	UserId      int     `json:"user_id" gorm:"index"`
	ChannelId   int     `json:"channel_id" gorm:"index"`
	Quota       int     `json:"quota"`
	UptimeHours float64 `json:"uptime_hours"`
	UsageCount  int64   `json:"usage_count"`
	CreatedAt   int64   `json:"created_at" gorm:"bigint"`
}

func RecordChannelReward(reward *ChannelReward) error {
	return DB.Create(reward).Error
}

func GetChannelRewardsByUser(userId int, limit int) ([]*ChannelReward, error) {
	var rewards []*ChannelReward
	err := DB.Where("user_id = ?", userId).Order("id desc").Limit(limit).Find(&rewards).Error
	return rewards, err
}

func GetChannelTotalRewardQuota(channelId int) (int64, error) {
	var total int64
	err := DB.Model(&ChannelReward{}).Where("channel_id = ?", channelId).Select("coalesce(sum(quota), 0)").Scan(&total).Error
	return total, err
}

func GetChannelLastReward(channelId int) (*ChannelReward, error) {
	var reward ChannelReward
	err := DB.Where("channel_id = ?", channelId).Order("id desc").First(&reward).Error
	if err != nil {
		return nil, err
	}
	return &reward, nil
}
