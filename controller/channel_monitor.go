package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"

	"github.com/gin-gonic/gin"
)

func GetChannelMonitor(c *gin.Context) {
	channels, err := model.GetAllChannels(0, 0, true, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	type MonitorItem struct {
		Id           int     `json:"id"`
		Name         string  `json:"name"`
		Type         int     `json:"type"`
		Status       int     `json:"status"`
		ResponseTime int     `json:"response_time"`
		TestTime     int64   `json:"test_time"`
		Balance      float64 `json:"balance"`
		Group        string  `json:"group"`
		UserId       int     `json:"user_id"`
		Models       string  `json:"models"`
	}

	result := make([]*MonitorItem, 0, len(channels))
	for _, ch := range channels {
		item := &MonitorItem{
			Id:           ch.Id,
			Name:         ch.Name,
			Type:         ch.Type,
			Status:       ch.Status,
			ResponseTime: ch.ResponseTime,
			TestTime:     ch.TestTime,
			Balance:      ch.Balance,
			Group:        ch.Group,
			UserId:       ch.UserId,
			Models:       ch.Models,
		}
		result = append(result, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    result,
	})
}

func GetChannelMonitorDetail(c *gin.Context) {
	channelId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道ID格式错误",
		})
		return
	}

	channel, err := model.GetChannelById(channelId, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	limit := 30
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	logs, err := model.GetChannelUptimeLogs(channelId, limit)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	hoursData, err := model.GetChannelUptimeHourly(channelId, 24)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"channel":      channel,
			"logs":         logs,
			"hourly_stats": hoursData,
		},
	})
}
