package model

import (
	"time"
)

type ChannelUptimeLog struct {
	Id           int    `json:"id" gorm:"primaryKey"`
	ChannelId    int    `json:"channel_id" gorm:"index"`
	Status       int    `json:"status"` // 1=normal, 0=error
	ResponseTime int    `json:"response_time"`
	ErrorMsg     string `json:"error_msg"`
	TestedAt     int64  `json:"tested_at" gorm:"bigint"`
}

type HourlyStatus struct {
	Hour      int `json:"hour"`       // 0-23
	Status    int `json:"status"`     // 1=success, 0=error, -1=no data
	Success   int `json:"success"`    // success count
	Total     int `json:"total"`      // total count
	AvgTime   int `json:"avg_time"`   // avg response time
}

func RecordChannelUptimeLog(log *ChannelUptimeLog) error {
	return DB.Create(log).Error
}

func GetChannelUptimeLogs(channelId int, limit int) ([]*ChannelUptimeLog, error) {
	var logs []*ChannelUptimeLog
	err := DB.Where("channel_id = ?", channelId).Order("id desc").Limit(limit).Find(&logs).Error
	return logs, err
}

func GetChannelUptimeStats(channelId int, sinceTimestamp int64) (total int64, success int64, avgResponseTime float64, err error) {
	type stats struct {
		Total           int64   `gorm:"column:total"`
		Success         int64   `gorm:"column:success"`
		AvgResponseTime float64 `gorm:"column:avg_response_time"`
	}
	var result stats
	err = DB.Model(&ChannelUptimeLog{}).
		Select("count(*) as total, sum(case when status = 1 then 1 else 0 end) as success, avg(response_time) as avg_response_time").
		Where("channel_id = ? and tested_at >= ?", channelId, sinceTimestamp).
		Scan(&result).Error
	if err != nil {
		return 0, 0, 0, err
	}
	return result.Total, result.Success, result.AvgResponseTime, err
}

func GetChannelUptimeHourly(channelId int, hours int) ([]*HourlyStatus, error) {
	now := time.Now()
	result := make([]*HourlyStatus, hours)
	
	for i := 0; i < hours; i++ {
		hourStart := now.Add(-time.Duration(i+1) * time.Hour)
		hourEnd := now.Add(-time.Duration(i) * time.Hour)
		
		startTs := hourStart.Unix()
		endTs := hourEnd.Unix()
		
		type hourStats struct {
			Total   int64   `gorm:"column:total"`
			Success int64   `gorm:"column:success"`
			AvgTime float64 `gorm:"column:avg_time"`
		}
		var stats hourStats
		
		err := DB.Model(&ChannelUptimeLog{}).
			Select("count(*) as total, sum(case when status = 1 then 1 else 0 end) as success, avg(response_time) as avg_time").
			Where("channel_id = ? and tested_at >= ? and tested_at < ?", channelId, startTs, endTs).
			Scan(&stats).Error
		
		status := -1 // no data
		if stats.Total > 0 {
			if stats.Success == stats.Total {
				status = 1 // all success
			} else {
				status = 0 // has error
			}
		}
		
		result[hours-1-i] = &HourlyStatus{
			Hour:    hourStart.Hour(),
			Status:  status,
			Success: int(stats.Success),
			Total:   int(stats.Total),
			AvgTime: int(stats.AvgTime),
		}
		
		if err != nil {
			return nil, err
		}
	}
	
	return result, nil
}

func CleanOldUptimeLogs(beforeTimestamp int64) error {
	return DB.Where("tested_at < ?", beforeTimestamp).Delete(&ChannelUptimeLog{}).Error
}
