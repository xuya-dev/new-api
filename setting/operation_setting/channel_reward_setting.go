package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

type ChannelRewardSetting struct {
	Enabled        bool    `json:"enabled"`
	OnlinePerHour  int     `json:"online_per_hour"`
	UsageBonusRate float64 `json:"usage_bonus_rate"`
	MinUptimeRate  float64 `json:"min_uptime_rate"`
}

var channelRewardSetting = ChannelRewardSetting{
	Enabled:        true,
	OnlinePerHour:  1000,
	UsageBonusRate: 0.5,
	MinUptimeRate:  0.5,
}

func init() {
	config.GlobalConfig.Register("channel_reward_setting", &channelRewardSetting)
}

func GetChannelRewardSetting() *ChannelRewardSetting {
	return &channelRewardSetting
}
