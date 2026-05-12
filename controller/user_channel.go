package controller

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"

	"github.com/gin-gonic/gin"
)

func getUserId(c *gin.Context) int {
	return c.GetInt("id")
}

func getUserRole(c *gin.Context) int {
	return c.GetInt("role")
}

func maskChannelKeyForResponse(channel *model.Channel, userId int, userRole int) {
	if channel == nil {
		return
	}
	if userRole >= common.RoleAdminUser || channel.UserId == userId {
		return
	}
	channel.Key = common.MaskKey(channel.Key)
}

func maskChannelsKeysForResponse(channels []*model.Channel, userId int, userRole int) {
	for _, channel := range channels {
		maskChannelKeyForResponse(channel, userId, userRole)
	}
}

func GetUserChannels(c *gin.Context) {
	userId := getUserId(c)
	userRole := getUserRole(c)
	pageInfo := common.GetPageQuery(c)
	idSort, _ := strconv.ParseBool(c.Query("id_sort"))
	statusParam := c.Query("status")
	statusFilter := -1
	switch strings.ToLower(statusParam) {
	case "enabled", "1":
		statusFilter = common.ChannelStatusEnabled
	case "disabled", "0":
		statusFilter = 0
	}

	var channels []*model.Channel
	var total int64
	var err error

	channels, err = model.GetUserChannels(userId, pageInfo.GetStartIdx(), pageInfo.GetPageSize(), idSort)
	if err == nil {
		total, err = model.CountUserChannels(userId)
	}

	if err != nil {
		common.SysError("failed to get channels: " + err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取渠道列表失败",
		})
		return
	}

	if statusFilter >= 0 {
		filtered := make([]*model.Channel, 0, len(channels))
		for _, ch := range channels {
			if statusFilter == common.ChannelStatusEnabled && ch.Status != common.ChannelStatusEnabled {
				continue
			}
			if statusFilter == 0 && ch.Status == common.ChannelStatusEnabled {
				continue
			}
			filtered = append(filtered, ch)
		}
		channels = filtered
	}

	maskChannelsKeysForResponse(channels, userId, userRole)

	var rewardMap map[int]int64
	summaries, err := model.GetRewardSummaryByUser(userId)
	if err == nil && len(summaries) > 0 {
		rewardMap = make(map[int]int64, len(summaries))
		for _, s := range summaries {
			rewardMap[s.ChannelId] = s.TotalQuota
		}
	}

	type channelWithReward struct {
		*model.Channel
		RewardQuota int64 `json:"reward_quota,omitempty"`
	}

	items := channels
	if rewardMap != nil {
		enriched := make([]any, 0, len(channels))
		for _, ch := range channels {
			rq := rewardMap[ch.Id]
			enriched = append(enriched, channelWithReward{
				Channel:     ch,
				RewardQuota: rq,
			})
		}
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "",
			"data": gin.H{
				"items": enriched,
				"total": total,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"items": items,
			"total": total,
		},
	})
}

func AddUserChannel(c *gin.Context) {
	userId := getUserId(c)
	channel := model.Channel{}
	err := c.ShouldBindJSON(&channel)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	if channel.Name == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道名称不能为空",
		})
		return
	}
	if channel.Key == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "API Key 不能为空",
		})
		return
	}
	if channel.Type <= 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请选择渠道类型",
		})
		return
	}

	channel.UserId = userId
	channel.CreatedTime = common.GetTimestamp()
	channel.Status = common.ChannelStatusEnabled

	if channel.Group == "" {
		channel.Group = "default"
	}

	if err := channel.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}
	model.InitChannelCache()
	service.ResetProxyClientCache()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "渠道添加成功",
		"data":    channel.Id,
	})
}

func UpdateUserChannel(c *gin.Context) {
	userId := getUserId(c)
	userRole := getUserRole(c)
	channelId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道ID格式错误",
		})
		return
	}

	existing, err := model.GetChannelById(channelId, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道不存在",
		})
		return
	}

	if userRole < common.RoleAdminUser && existing.UserId != userId {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权修改该渠道",
		})
		return
	}

	updateData := model.Channel{}
	err = c.ShouldBindJSON(&updateData)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	if updateData.Name != "" {
		existing.Name = updateData.Name
	}
	if updateData.BaseURL != nil {
		existing.BaseURL = updateData.BaseURL
	}
	if updateData.Models != "" {
		existing.Models = updateData.Models
	}
	if updateData.Group != "" {
		existing.Group = updateData.Group
	}
	if updateData.Key != "" {
		existing.Key = updateData.Key
	}
	if updateData.Status == common.ChannelStatusEnabled || updateData.Status == common.ChannelStatusManuallyDisabled {
		existing.Status = updateData.Status
	}

	if err := existing.Update(); err != nil {
		common.ApiError(c, err)
		return
	}
	model.InitChannelCache()
	service.ResetProxyClientCache()

	maskChannelKeyForResponse(existing, userId, userRole)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "渠道更新成功",
		"data":    existing,
	})
}

func DeleteUserChannel(c *gin.Context) {
	userId := getUserId(c)
	userRole := getUserRole(c)
	channelId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道ID格式错误",
		})
		return
	}

	existing, err := model.GetChannelById(channelId, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道不存在",
		})
		return
	}

	if userRole < common.RoleAdminUser && existing.UserId != userId {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权删除该渠道",
		})
		return
	}

	channel := model.Channel{Id: channelId}
	if err := channel.Delete(); err != nil {
		common.ApiError(c, err)
		return
	}
	model.InitChannelCache()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "渠道删除成功",
	})
}

func TestUserChannel(c *gin.Context) {
	userId := getUserId(c)
	userRole := getUserRole(c)
	channelId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道ID格式错误",
		})
		return
	}

	channel, err := model.GetChannelById(channelId, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道不存在",
		})
		return
	}

	if userRole < common.RoleAdminUser && channel.UserId != userId {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权测试该渠道",
		})
		return
	}

	tik := time.Now()
	testModel := c.Query("model")
	endpointType := c.Query("endpoint_type")
	isStream, _ := strconv.ParseBool(c.Query("stream"))
	result := testChannel(channel, testModel, endpointType, isStream)
	tok := time.Now()
	milliseconds := tok.Sub(tik).Milliseconds()

	if result.localErr != nil {
		resp := gin.H{
			"success": false,
			"message": result.localErr.Error(),
			"time":    0.0,
		}
		if result.newAPIError != nil {
			resp["error_code"] = result.newAPIError.GetErrorCode()
		}
		c.JSON(http.StatusOK, resp)
		return
	}
	go channel.UpdateResponseTime(milliseconds)
	consumedTime := float64(milliseconds) / 1000.0
	if result.newAPIError != nil {
		c.JSON(http.StatusOK, gin.H{
			"success":    false,
			"message":    result.newAPIError.Error(),
			"time":       consumedTime,
			"error_code": result.newAPIError.GetErrorCode(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"time":    consumedTime,
	})
}

func GetUserChannel(c *gin.Context) {
	userId := getUserId(c)
	userRole := getUserRole(c)
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
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "渠道不存在",
		})
		return
	}

	if userRole < common.RoleAdminUser && channel.UserId != userId {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权查看该渠道",
		})
		return
	}

	maskChannelKeyForResponse(channel, userId, userRole)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    channel,
	})
}
