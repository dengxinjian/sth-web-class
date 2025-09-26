<template>
  <div class="container">
    <div
      style="color: #999; font-size: 12px; font-weight: 600; padding: 10px 0"
    >
      公告：2025.9.26前绑定‘佳明国际’及‘高驰’账号的用户需要在小程序左滑解绑设备后重新绑定，方能收到课表通知。
    </div>
    <div class="schedule-top">
      <WeekRangePicker @week-change="onWeekChange" />
      <div class="schedule-search">
        <div>
          <span>团队：</span>
          <el-select
            v-model="selectedTeam"
            size="mini"
            placeholder="选择团队"
            @change="handleTeamChange"
          >
            <el-option
              v-for="t in teamList"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
        </div>
        <div>
          <span>运动员：</span>
          <el-select
            v-model="selectedAthletic"
            size="mini"
            placeholder="选择人员"
            @change="handleAthleticChange"
          >
            <el-option
              v-for="t in athleticList"
              :key="t.triUserId"
              :label="t.name"
              :value="t.triUserId"
            />
          </el-select>
        </div>
        <el-button
          type="text"
          size="mini"
          :disabled="!athleticInfoData.triUserId"
          @click="showAthleticInfoDialog = true"
          >信息查看</el-button
        >
        <el-button
          type="text"
          size="mini"
          :disabled="!athleticInfoData.triUserId"
          @click="showMonthStatisticDialog = true"
          >月度统计</el-button
        >
      </div>
    </div>
    <div class="athletic-container">
      <div class="type-change">
        <ul class="type-change-list">
          <li
            :class="activeName === 'athletic' ? 'active' : ''"
            @click="handleTypeChange('athletic')"
          >
            我的团队
          </li>
          <li
            :class="activeName === 'class' ? 'active' : ''"
            @click="handleTypeChange('class')"
          >
            课程
          </li>
        </ul>
        <div v-if="activeName === 'athletic'">
          <AthleticManagement
            :teamId="selectedTeam"
            :teamName="teamList.find((item) => item.id === selectedTeam)?.name"
          ></AthleticManagement>
        </div>
        <div v-else class="class-container">
          <div class="class-title">课程</div>
          <div class="class-operation">
            <el-button type="primary" size="mini" @click="handleAddClass"
              >新增课程</el-button
            >
            <el-input size="mini" v-model="classSearchInput">
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getClassList"
              ></el-button>
            </el-input>
          </div>
          <div class="schedule-class-container">
            <el-collapse accordion @change="classSlideChange">
              <el-collapse-item v-for="item in classList" :key="item.groupId">
                <template slot="title">
                  <div class="schedule-class-title">
                    <div class="group-name">{{ item.groupName }}</div>
                    <el-popover
                      popper-class="athletic-btn-popover"
                      placement="right"
                      width="80"
                      trigger="hover"
                    >
                      <div
                        style="
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                        "
                      >
                        <span
                          ><el-button type="text" @click="handleAddGroup"
                            >新建分组</el-button
                          ></span
                        >
                        <span
                          ><el-button
                            type="text"
                            :disabled="!item.groupId"
                            @click="
                              handleEditGroup(item.groupId, item.groupName)
                            "
                            >编辑分组</el-button
                          ></span
                        >
                        <span
                          ><el-button
                            type="text"
                            :disabled="!item.groupId"
                            @click="handleDeleteGroup(item.groupId)"
                            >删除分组</el-button
                          ></span
                        >
                        <span
                          ><el-button
                            type="text"
                            :disabled="!item.groupId"
                            @click="handleMoveGroup(item.groupId)"
                            >移动分组</el-button
                          ></span
                        >
                      </div>
                      <i
                        class="el-icon-more"
                        slot="reference"
                        @click.stop="handleClassMoreClick"
                      ></i>
                    </el-popover>
                  </div>
                </template>
                <div class="js-class-drag-container" :key="item.timespan">
                  <div
                    v-for="part in item.classesList"
                    :key="part.id"
                    class="schedule-class"
                    :data-id="part.id"
                    data-type="classTemplate"
                    @click="handleClassDetail(part.id, part.sportType)"
                  >
                    <div class="schedule-class-info">
                      <div class="schedule-class-info-item-title">
                        <span>{{ part.classesJson.title }}</span>
                        <div
                          class="delete"
                          @click.stop="handleMoveClass(part.id, item.groupId)"
                        >
                          <i class="el-icon-set-up"></i>
                        </div>
                        <div
                          class="delete"
                          @click.stop="handleDeleteClass(part.id)"
                        >
                          <i class="el-icon-delete"></i>
                        </div>
                      </div>
                      <div class="schedule-class-info-item-content">
                        <span v-if="part.sportType === 'SWIM'">
                          <img src="~@/assets/addClass/icon-swim.png" alt="" />
                        </span>
                        <span v-else-if="part.sportType === 'CYCLE'">
                          <img src="~@/assets/addClass/icon-bike.png" alt="" />
                        </span>
                        <span v-else-if="part.sportType === 'RUN'">
                          <img src="~@/assets/addClass/icon-run.png" alt="" />
                        </span>
                        <span v-else-if="part.sportType === 'STRENGTH'">
                          <img src="~@/assets/addClass/icon-power.png" alt="" />
                        </span>
                        <span v-else-if="part.sportType === 'OTHER'">
                          <img src="~@/assets/addClass/icon-other.png" alt="" />
                        </span>
                        <span v-else-if="part.sportType === 'REMARK'">
                          <img src="~@/assets/addClass/icon-note.png" alt="" />
                        </span>
                        <span v-else-if="part.sportType === 'REST'">
                          <img src="~@/assets/addClass/icon-rest.png" alt="" />
                        </span>
                        <span v-else>
                          <img src="~@/assets/addClass/icon-other.png" alt="" />
                        </span>
                        <span
                          v-if="
                            ['RUN', 'CYCLE', 'SWIM', 'STRENGTH'].includes(
                              part.sportType
                            )
                          "
                          >{{ part.classesJson.duration }}</span
                        >
                        <span
                          v-if="
                            ['RUN', 'CYCLE', 'SWIM'].includes(part.sportType) &&
                            part.classesJson.distance
                          "
                        >
                          {{ part.classesJson.distance
                          }}<span v-if="part.sportType === 'SWIM'">{{
                            part.classesJson.distanceUnit
                          }}</span
                          ><span v-else>km</span>
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="part.classesJson.timeline"
                      style="height: 16px; display: flex; gap: 2px"
                    >
                      <div
                        v-for="(i, index) in part.classesJson.timeline"
                        :key="index"
                        class="time-stage"
                        :style="{ flex: i.duration }"
                      >
                        <div
                          :style="{
                            display: 'flex',
                            gap: '2px',
                            height: '16px',
                          }"
                        >
                          <div
                            v-for="n in i.times"
                            :key="n"
                            :style="{ flex: 1 }"
                          >
                            <ExerciseProcessChart
                              :exerciseList="i.stageTimeline"
                              :maxIntensity="part.classesJson.maxIntensity"
                              :height="16"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>

      <div class="schedule" v-loading="loading">
        <div class="schedule-table">
          <div class="schedule-table-header">
            <div
              v-for="(item, index) in weekList"
              :key="item.id"
              :class="
                currentWeek[index]?.commonDate ===
                new Date().toISOString().split('T')[0]
                  ? 'schedule-table-header-cell active'
                  : 'schedule-table-header-cell'
              "
            >
              {{ item.name }}
              {{
                currentWeek[index]?.commonDate ===
                new Date().toISOString().split("T")[0]
                  ? "（今天）"
                  : ""
              }}
            </div>
            <div class="schedule-table-header-cell-data">
              <!-- <div style="font-size: 14px; font-weight: 600;">
                同步开关
              </div> -->
              <div style="display: flex; flex-direction: row; gap: 10px">
                <el-switch
                  v-for="item in deviceList"
                  :key="item.id"
                  v-model="item.enabled"
                  :inactive-text="
                    item.deviceType
                      ? deviceTypeDict[item.deviceType]
                      : '未知设备'
                  "
                  @change="handleDeviceChange(item)"
                ></el-switch>
              </div>
            </div>
          </div>
          <div class="schedule-table-body">
            <div
              v-for="item in currentWeek"
              :key="item.timesp"
              class="schedule-table-cell"
            >
              <div class="schedule-table-cell-title">
                {{ item?.commonDate }}
              </div>
              <!-- {{ item.classSchedule }} -->
              <div
                class="schedule-table-cell-item js-schedule-drag-container"
                :data-date="item.commonDate"
              >
                <!-- 课表循环 -->
                <div
                  v-for="classItem in item.classSchedule"
                  :key="classItem.id"
                  class="classScheduleCard"
                  :style="
                    item.commonDate < new Date().toISOString().split('T')[0]
                      ? 'background-color: rgba(204, 35, 35, 1)'
                      : 'background-color: #fff'
                  "
                  :data-id="classItem.id"
                  :data-date="item.commonDate"
                  @click="
                    handleClassSchedulaDetail(classItem.id, classItem.sportType)
                  "
                >
                  <div class="card-body" style="background-color: white">
                    <div class="body-title">
                      <div class="sport-type-icon">
                        <img
                          class="image-icon"
                          :src="getClassImageIcon(classItem.sportType)"
                          alt=""
                        />
                        <div
                          :class="[
                            'sport-type-name',
                            'sport-type-color' + device.syncStatus,
                          ]"
                          v-for="device in classItem.syncStatusList"
                          :key="device.deviceType + device.syncStatus"
                          @click.stop="
                            handleDeviceClick(
                              classItem,
                              device,
                              item.commonDate
                            )
                          "
                        >
                          {{ deviceTypeIconDict[device.deviceType] }}
                        </div>
                      </div>
                      <i
                        class="el-icon-delete"
                        @click.stop="handleDeleteClassSchedule(classItem.id)"
                      ></i>
                    </div>
                    <div class="title">{{ classItem.classesJson.title }}</div>
                    <div class="keyword">
                      {{ classItem.sportType }}
                    </div>
                    <div
                      class="keyword"
                      v-if="
                        classItem.sportType !== 'REST' &&
                        classItem.sportType !== 'REMARK' &&
                        classItem.sportType !== 'OTHER'
                      "
                    >
                      {{ classItem.classesJson.duration }}
                    </div>
                    <div style="display: flex">
                      <div class="keyword">
                        {{ classItem.classesJson.distance
                        }}<span v-if="classItem.sportType === 'SWIM'">{{
                          classItem.classesJson.distanceUnit
                        }}</span>
                      </div>
                      <div>&nbsp;&nbsp;</div>
                    </div>
                    <div
                      style="display: flex"
                      v-if="
                        classItem.sportType !== 'REST' &&
                        classItem.sportType !== 'REMARK' &&
                        classItem.sportType !== 'OTHER'
                      "
                    >
                      <div class="keyword">{{ classItem.classesJson.sth }}</div>
                      <div>&nbsp;&nbsp;STH</div>
                    </div>
                    <div
                      v-if="classItem.classesJson.summary"
                      class="stage-details"
                    >
                      {{ classItem.classesJson.summary }}
                    </div>
                    <div
                      v-else-if="classItem.sportType === 'CYCLE'"
                      class="stage-details"
                    >
                      <div
                        v-for="(stage, index) in classItem.classesJson.stages"
                        :key="index"
                        class="stage-item"
                      >
                        <div v-for="(part, idx) in stage.sections" :key="idx">
                          <div>{{ part.title }}</div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 1 &&
                              part.range === 'range'
                            "
                          >
                            {{ part.target }} @
                            {{ part.thresholdFtpRangeNum[0] }}~
                            {{ part.thresholdFtpRangeNum[1] }}w
                            <span v-if="part?.thresholdFtpRangeNumZone"
                              >{{ part.thresholdFtpRangeNumZone[0] }}~{{
                                part.thresholdFtpRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 2 &&
                              part.range === 'range'
                            "
                          >
                            {{ part.target }} @
                            {{ part.thresholdHeartRateRangeNum[0] }}~
                            {{ part.thresholdHeartRateRangeNum[1] }}bpm
                            <span v-if="part?.thresholdHeartRateRangeNumZone"
                              >{{ part.thresholdHeartRateRangeNumZone[0] }}~{{
                                part.thresholdHeartRateRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 1 &&
                              part.range === 'target'
                            "
                          >
                            {{ part.target }} @ {{ part.thresholdFtpNum }}w
                            <span v-if="part?.thresholdFtpNumZone">{{
                              part.thresholdFtpNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 2 &&
                              part.range === 'target'
                            "
                          >
                            {{ part.target }} @
                            {{ part.thresholdHeartRateNum }}bpm
                            <span v-if="part?.thresholdHeartRateNumZone">{{
                              part.thresholdHeartRateNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 3 &&
                              part.range === 'range'
                            "
                          >
                            {{ part.target }} @ {{ part.targetFtpRange[0] }}~
                            {{ part.targetFtpRange[1] }}w
                            <span v-if="part.targetFtpRangeNumZone"
                              >{{ part.targetFtpRangeNumZone[0] }}~{{
                                part.targetFtpRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 4 &&
                              part.range === 'range'
                            "
                          >
                            {{ part.target }} @
                            {{ part.targetHeartRateRange[0] }}~
                            {{ part.targetHeartRateRange[1] }}bpm
                            <span v-if="part.targetHeartRateRangeNumZone"
                              >{{ part.targetHeartRateRangeNumZone[0] }}~{{
                                part.targetHeartRateRangeNumZone[1]
                              }}</span
                            >
                            <!-- <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span -->
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 3 &&
                              part.range === 'target'
                            "
                          >
                            {{ part.target }} @ {{ part.targetFtp }}w
                            <span v-if="part.targetFtpNumZone">{{
                              part.targetFtpNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 4 &&
                              part.range === 'target'
                            "
                          >
                            {{ part.target }} @ {{ part.targetHeartRate }}bpm
                            <span v-if="part.targetHeartRateNumZone">{{
                              part.targetHeartRateNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >踏频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                        </div>
                        <div v-if="stage.times > 1">
                          重复{{ stage.times }}次
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="classItem.sportType === 'RUN'"
                      class="stage-details"
                    >
                      <div
                        v-for="(stage, index) in classItem.classesJson.stages"
                        :key="index"
                        class="stage-item"
                      >
                        <div v-for="(part, idx) in stage.sections" :key="idx">
                          <div>{{ part.title }}</div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 1 &&
                              part.range === 'range'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @
                            {{ secondsToMMSS(part.thresholdSpeedRangeNum[0]) }}~
                            {{
                              secondsToMMSS(part.thresholdSpeedRangeNum[1])
                            }}/km
                            <span v-if="part.thresholdSpeedRangeNumZone"
                              >{{ part.thresholdSpeedRangeNumZone[0] }}~{{
                                part.thresholdSpeedRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 2 &&
                              part.range === 'range'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ part.thresholdHeartRateRangeNum[0] }}~
                            {{ part.thresholdHeartRateRangeNum[1] }}bpm
                            <span v-if="part.thresholdHeartRateRangeNumZone"
                              >{{ part.thresholdHeartRateRangeNumZone[0] }}~{{
                                part.thresholdHeartRateRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 1 &&
                              part.range === 'target'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ secondsToMMSS(part.thresholdSpeedNum) }}/km
                            <span v-if="part.thresholdSpeedNumZone">{{
                              part.thresholdSpeedNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 2 &&
                              part.range === 'target'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ part.thresholdHeartRateNum }}bpm
                            <span v-if="part.thresholdHeartRateNumZone">{{
                              part.thresholdHeartRateNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 3 &&
                              part.range === 'range'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ part.targetSpeedRange[0] }}~
                            {{ part.targetSpeedRange[1] }}/km
                            <span v-if="part.targetSpeedRangeNumZone"
                              >{{ part.targetSpeedRangeNumZone[0] }}~{{
                                part.targetSpeedRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 4 &&
                              part.range === 'range'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ part.targetHeartRateRange[0] }}~
                            {{ part.targetHeartRateRange[1] }}bpm
                            <span v-if="part.targetHeartRateRangeNumZone"
                              >{{ part.targetHeartRateRangeNumZone[0] }}~{{
                                part.targetHeartRateRangeNumZone[1]
                              }}</span
                            >
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 3 &&
                              part.range === 'target'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ part.targetSpeed }}/km
                            <span v-if="part.targetSpeedNumZone">{{
                              part.targetSpeedNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                          <div
                            v-if="
                              classItem.classesJson.mode === 4 &&
                              part.range === 'target'
                            "
                          >
                            {{
                              part.capacity === "time"
                                ? part.target
                                : part.targetDistance + part.targetUnit
                            }}
                            @ {{ part.targetHeartRate }}bpm
                            <span v-if="part.targetHeartRateNumZone">{{
                              part.targetHeartRateNumZone
                            }}</span>
                            <span v-if="part.hasCadence"
                              >步频{{ part.cadence[0] }}~{{
                                part.cadence[1]
                              }}</span
                            >
                          </div>
                        </div>
                        <div v-if="stage.times > 1">
                          重复{{ stage.times }}次
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="classItem.classesJson.timeline"
                      style="height: 16px; display: flex; gap: 2px"
                    >
                      <div
                        v-for="(i, index) in classItem.classesJson.timeline"
                        :key="index"
                        class="time-stage"
                        :style="{ flex: i.duration }"
                      >
                        <div
                          :style="{
                            display: 'flex',
                            gap: '2px',
                            height: '16px',
                          }"
                        >
                          <div
                            v-for="n in i.times"
                            :key="n"
                            :style="{ flex: 1 }"
                          >
                            <ExerciseProcessChart
                              :exerciseList="i.stageTimeline"
                              :maxIntensity="classItem.classesJson.maxIntensity"
                              :height="16"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 运动循环 -->
                <div
                  v-for="activityItem in item.activityList"
                  :key="activityItem.activityId"
                  class="classScheduleCard sportScheduleCard js-sport-container-put js-sport-container-noDrag"
                  :style="{
                    backgroundColor: getSportBackgroundColor(
                      activityItem.percent
                    )[0],
                  }"
                  :data-id="activityItem.activityId"
                >
                  <div
                    class="card-body"
                    :style="{
                      backgroundColor: '#fff',
                    }"
                  >
                    <div
                      class="body-title"
                      :style="{
                        backgroundColor: '#fff',
                      }"
                    >
                      <div class="sport-type-icon">
                        <img
                          class="image-icon"
                          :src="getSportImageIcon(activityItem.sportType)"
                          alt=""
                        />
                      </div>
                      <el-popover
                        popper-class="athletic-btn-popover"
                        placement="right"
                        trigger="click"
                      >
                        <div class="btn-list-hover">
                          <el-button
                            v-if="activityItem.classesJson"
                            type="text"
                            @click="handleUnbind(activityItem.classScheduleId)"
                            >解除匹配</el-button
                          >
                          <el-button
                            v-if="!activityItem.classesJson"
                            type="text"
                            @click="
                              handleDeleteActivity(activityItem.activityId)
                            "
                            >删除</el-button
                          >
                        </div>
                        <i class="el-icon-more" slot="reference"></i>
                      </el-popover>
                    </div>

                    <div
                      class="sport-record-data"
                      @click="
                        handleSportDetail(
                          activityItem.activityId,
                          activityItem.classScheduleId,
                          activityItem.sportType
                        )
                      "
                    >
                      <div class="title">{{ activityItem.activityName }}</div>
                      <div class="keyword">{{ activityItem.duration }}</div>
                      <div style="display: flex">
                        <div class="keyword">{{ activityItem.distance }}</div>
                        <div>km</div>
                      </div>
                      <div style="display: flex">
                        <div class="keyword">{{ activityItem.sthValue }}</div>
                        <div>&nbsp;&nbsp;STH</div>
                      </div>
                      <div v-if="activityItem.classScheduleId">
                        <!-- 运动匹配课表之后，显示课表相关内容 -->
                        <div
                          v-if="activityItem.classesJson.summary"
                          class="stage-details"
                        >
                          {{ activityItem.classesJson.summary }}
                        </div>
                        <div
                          v-else-if="activityItem.sportType === 1"
                          class="stage-details"
                        >
                          <div
                            v-for="(stage, index) in activityItem.classesJson
                              .stages"
                            :key="index"
                            class="stage-item"
                          >
                            <div
                              v-for="(part, idx) in stage.sections"
                              :key="idx"
                            >
                              <div>{{ part.title }}</div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 1 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.thresholdFtpRangeNum[0] }}~
                                {{ part.thresholdFtpRangeNum[1] }}w
                                <span v-if="part?.thresholdFtpRangeNumZone"
                                  >{{ part.thresholdFtpRangeNumZone[0] }}~{{
                                    part.thresholdFtpRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 2 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.thresholdHeartRateRangeNum[0] }}~
                                {{ part.thresholdHeartRateRangeNum[1] }}bpm
                                <span
                                  v-if="part?.thresholdHeartRateRangeNumZone"
                                  >{{
                                    part.thresholdHeartRateRangeNumZone[0]
                                  }}~{{
                                    part.thresholdHeartRateRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 1 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @ {{ part.thresholdFtpNum }}w
                                <span v-if="part?.thresholdFtpNumZone">{{
                                  part.thresholdFtpNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 2 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @
                                {{ part.thresholdHeartRateNum }}bpm
                                <span v-if="part?.thresholdHeartRateNumZone">{{
                                  part.thresholdHeartRateNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 3 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.targetFtpRange[0] }}~
                                {{ part.targetFtpRange[1] }}w
                                <span v-if="part.targetFtpRangeNumZone"
                                  >{{ part.targetFtpRangeNumZone[0] }}~{{
                                    part.targetFtpRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 4 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.targetHeartRateRangeNum[0] }}~
                                {{ part.targetHeartRateRangeNum[1] }}bpm
                                <span v-if="part.targetHeartRateRangeNumZone"
                                  >{{ part.targetHeartRateRangeNumZone[0] }}~{{
                                    part.targetHeartRateRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 3 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @ {{ part.targetFtp }}w
                                <span v-if="part.targetFtpNumZone">{{
                                  part.targetFtpNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 4 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @
                                {{ part.targetHeartRate }}bpm
                                <span v-if="part.targetHeartRateNumZone">{{
                                  part.targetHeartRateNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >踏频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                            </div>
                            <div v-if="stage.times > 1">
                              重复{{ stage.times }}次
                            </div>
                          </div>
                        </div>
                        <div
                          v-else-if="activityItem.sportType === 2"
                          class="stage-details"
                        >
                          <div
                            v-for="(stage, index) in activityItem.classesJson
                              .stages"
                            :key="index"
                            class="stage-item"
                          >
                            <div
                              v-for="(part, idx) in stage.sections"
                              :key="idx"
                            >
                              <div>{{ part.title }}</div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 1 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{
                                  secondsToMMSS(part.thresholdSpeedRangeNum[0])
                                }}~
                                {{
                                  secondsToMMSS(part.thresholdSpeedRangeNum[1])
                                }}/km
                                <span v-if="part?.thresholdSpeedRangeNumZone"
                                  >{{ part.thresholdSpeedRangeNumZone[0] }}~{{
                                    part.thresholdSpeedRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 2 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.thresholdHeartRateRangeNum[0] }}~
                                {{ part.thresholdHeartRateRangeNum[1] }}bpm
                                <span
                                  v-if="part?.thresholdHeartRateRangeNumZone"
                                  >{{
                                    part.thresholdHeartRateRangeNumZone[0]
                                  }}~{{
                                    part.thresholdHeartRateRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 1 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @
                                {{ secondsToMMSS(part.thresholdSpeedNum) }}/km
                                <span v-if="part?.thresholdSpeedNumZone">{{
                                  part.thresholdSpeedNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 2 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @
                                {{ part.thresholdHeartRateNum }}bpm
                                <span v-if="part?.thresholdHeartRateNumZone">{{
                                  part.thresholdHeartRateNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 3 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.targetSpeedRange[0] }}~
                                {{ part.targetSpeedRange[1] }}/km
                                <span v-if="part.targetSpeedRangeNumZone"
                                  >{{ part.targetSpeedRangeNumZone[0] }}~{{
                                    part.targetSpeedRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 4 &&
                                  part.range === 'range'
                                "
                              >
                                {{ part.target }} @
                                {{ part.targetHeartRateRange[0] }}~
                                {{ part.targetHeartRateRange[1] }}bpm
                                <span v-if="part.targetHeartRateRangeNumZone"
                                  >{{ part.targetHeartRateRangeNumZone[0] }}~{{
                                    part.targetHeartRateRangeNumZone[1]
                                  }}</span
                                >
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 3 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @ {{ part.targetSpeed }}/km
                                <span v-if="part.targetSpeedNumZone">{{
                                  part.targetSpeedNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                              <div
                                v-if="
                                  activityItem.classesJson.mode === 4 &&
                                  part.range === 'target'
                                "
                              >
                                {{ part.target }} @
                                {{ part.targetHeartRate }}bpm
                                <span v-if="part.targetHeartRateNumZone">{{
                                  part.targetHeartRateNumZone
                                }}</span>
                                <span v-if="part.hasCadence"
                                  >步频{{ part.cadence[0] }}~{{
                                    part.cadence[1]
                                  }}</span
                                >
                              </div>
                            </div>
                            <div v-if="stage.times > 1">
                              重复{{ stage.times }}次
                            </div>
                          </div>
                        </div>

                        <div class="keyword">
                          {{ activityItem.classesJson.duration }}
                        </div>
                        <div style="display: flex">
                          <div class="keyword">
                            {{ activityItem.classesJson.distance
                            }}<span v-if="activityItem.sportType === 3">{{
                              activityItem.classesJson.distanceUnit
                            }}</span>
                          </div>
                        </div>
                        <div style="display: flex">
                          <div class="keyword">
                            {{ activityItem.classesJson.sth }}
                          </div>
                          <div>&nbsp;&nbsp;STH</div>
                        </div>

                        <div
                          v-if="activityItem.classesJson.timeline"
                          style="height: 16px; display: flex; gap: 2px"
                        >
                          <div
                            v-for="(i, index) in activityItem.classesJson
                              .timeline"
                            :key="index"
                            class="time-stage"
                            :style="{ flex: i.duration }"
                          >
                            <div
                              :style="{
                                display: 'flex',
                                gap: '2px',
                                height: '16px',
                              }"
                            >
                              <div
                                v-for="n in i.times"
                                :key="n"
                                :style="{ flex: 1 }"
                              >
                                <ExerciseProcessChart
                                  :exerciseList="i.stageTimeline"
                                  :maxIntensity="
                                    activityItem.classesJson.maxIntensity
                                  "
                                  :height="16"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="schedule-table-cell-data">
              <div class="week-data-sth">
                <div>
                  <span>{{ sthData.avgLong ? sthData.avgLong : 0 }}</span>
                  <span>长期STH</span>
                </div>
                <div>
                  <span>{{ sthData.avgShort ? sthData.avgShort : 0 }}</span>
                  <span>短期STH</span>
                </div>
                <div>
                  <span>{{
                    sthData.avgBalanceBig
                      ? sthData.avgBalanceBig - sthData.avgBalanceSmall
                      : 0
                  }}</span>
                  <span>STH平衡</span>
                </div>
              </div>
              <div
                v-for="item in statisticData"
                :key="item.title"
                class="week-data-item"
              >
                <div class="week-data-text">
                  <div style="display: flex; align-items: center">
                    <img
                      v-if="item.icon"
                      style="width: 20px; margin-right: 10px"
                      :src="item.icon"
                      alt=""
                    />
                    <p>{{ item.title }}:</p>
                    <div
                      style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                      "
                    >
                      <span>{{ item.actualValue }} {{ item.unit }}</span>
                      <span>{{ item.planValue }} {{ item.unit }}</span>
                    </div>
                  </div>
                </div>
                <el-progress
                  :percentage="item.percent || 0"
                  :color="item.color"
                  :show-text="false"
                ></el-progress>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AthleticInfoDialog
      v-model="showAthleticInfoDialog"
      :data="athleticInfoData"
      @save="onSaveAthleticInfo"
    />
    <MonthStatisticDialog
      v-model="showMonthStatisticDialog"
      :triUserId="selectedAthletic"
      :currentMonth="currentMonth"
      @cancel="onCancelMonthStatistic"
    />
    <SportTypeModal
      v-model="showSportTypeModal"
      :data="classModalData"
      @select="onSelectSportType"
    />
    <SportDetailModal
      v-model="showSportDetailModal"
      :type="sportDetailData.sportType"
      :data="sportDetailData"
      @cancel="onCancelSportDetail"
    />
    <AddSwimClass
      v-model="showAddSwimClass"
      :data="classModalData"
      @save="onSaveAddSwimClass"
      :type="classModalDataType"
    />
    <AddRunClass
      v-model="showAddRunClass"
      :data="classModalData"
      @save="onSaveAddRunClass"
      :type="classModalDataType"
    />
    <AddBikeClass
      v-model="showAddBikeClass"
      :data="classModalData"
      @save="onSaveAddBikeClass"
      :type="classModalDataType"
    />
    <AddPowerClass
      v-model="showAddPowerClass"
      :data="classModalData"
      @save="onSaveAddPowerClass"
      :type="classModalDataType"
    />
    <AddNoteClass
      v-model="showAddNoteClass"
      :data="classModalData"
      @save="onSaveAddNoteClass"
      :type="classModalDataType"
    />
    <AddOtherClass
      v-model="showAddOtherClass"
      :data="classModalData"
      @save="onSaveAddOtherClass"
      :type="classModalDataType"
    />
    <AddRestClass
      v-model="showAddRestClass"
      :data="classModalData"
      @save="onSaveAddRestClass"
      :type="classModalDataType"
    />
    <AddClassTitle
      v-model="showAddClassTitle"
      :groups="[
        { id: 1, name: '我的课程' },
        { id: 2, name: '团队课程' },
      ]"
      @save="onSaveClassTitle"
    />
    <AddGroup
      v-model="showAddGroup"
      :data="currentGroup"
      @save="onSaveAddGroup"
    ></AddGroup>
    <MoveGroup
      v-model="showMoveGroup"
      :id="moveGroupId"
      :class-id="moveClassId"
      :type="moveType"
      @save="onSaveMoveGroup"
    ></MoveGroup>
    <BindModal
      v-model="showBindModal"
      :exercise-data="bindExerciseData"
      :course-data="bindCourseData"
      :type="bindType"
      @bind="onBind"
      @cancel="onCancelBind"
    ></BindModal>
    <ClassDetailModal
      v-model="showClassDetailModal"
      :type="classSportType"
      :data="classDetailData"
      @save="handleClassDetailSave"
      :athleticThreshold="athleticThreshold"
      :triUserId="selectedAthletic"
    ></ClassDetailModal>
  </div>
</template>
<script>
import Sortable from "sortablejs";
import WeekRangePicker from "@/components/WeekRangePicker";
import AthleticInfoDialog from "@/views/classManagement/components/AthleticInfo";
import MonthStatisticDialog from "@/views/classManagement/components/MonthStatistic";
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import AthleticManagement from "@/views/classManagement/components/AthleticManagement";
import AddSwimClass from "@/views/classManagement/components/AddSwimClass";
import AddPowerClass from "@/views/classManagement/components/AddPowerClass";
import AddNoteClass from "@/views/classManagement/components/AddNoteClass";
import AddOtherClass from "@/views/classManagement/components/AddOtherClass";
import AddBikeClass from "@/views/classManagement/components/AddBikeClass";
import AddRunClass from "@/views/classManagement/components/AddRunClass";
import AddRestClass from "@/views/classManagement/components/AddRestClass";
import SportTypeModal from "@/views/classManagement/components/SportTypeModal";
import AddClassTitle from "@/views/classManagement/components/AddClassTitle";
import AddGroup from "@/views/classManagement/components/AddGroup";
import MoveGroup from "@/views/classManagement/components/MoveGroup";
import BindModal from "@/views/classManagement/components/BindModal";
import SportDetailModal from "@/views/classManagement/components/SportDetailModal";
import ClassDetailModal from "./components/ClassDetailModal";
import { getLunarDate, secondsToHHMMSS, secondsToMMSS } from "@/utils/index";
import { getData, submitData } from "@/api/common.js";
import { MessageBox } from "element-ui";
import { statisticKeyToTitle, unitConversion } from "./statisticKeyToTitle";
import { CalculateRun, CalculateBike } from "./uilt";

export default {
  name: "ClassManagement",
  components: {
    WeekRangePicker,
    AthleticInfoDialog,
    MonthStatisticDialog,
    ExerciseProcessChart,
    AthleticManagement,
    AddSwimClass,
    AddBikeClass,
    AddRunClass,
    AddPowerClass,
    AddNoteClass,
    AddOtherClass,
    AddRestClass,
    SportTypeModal,
    AddClassTitle,
    AddGroup,
    MoveGroup,
    BindModal,
    SportDetailModal,
    ClassDetailModal,
  },
  data() {
    return {
      activeName: "athletic",
      dataLineType: "week",
      teamList: [],
      athleticList: [],
      selectedAthletic: null,
      selectedTeam: null,
      weekList: [
        { id: 1, name: "周一" },
        { id: 2, name: "周二" },
        { id: 3, name: "周三" },
        { id: 4, name: "周四" },
        { id: 5, name: "周五" },
        { id: 6, name: "周六" },
        { id: 7, name: "周日" },
      ],
      currentWeekClass: [
        { id: 1, name: "课程1" },
        { id: 2, name: "课程2" },
      ],
      nextWeekClass: [
        { id: 1, name: "课程1" },
        { id: 2, name: "课程2" },
      ],
      showAthleticInfoDialog: false,
      currentWeek: [],
      nextWeek: [],
      basicExerciseList: [
        { duration: 30, intensity: 80 }, // 30分钟，强度80%
        { duration: 45, intensity: 60 }, // 45分钟，强度60%
        { duration: 20, intensity: 90 }, // 20分钟，强度90%
      ],
      showAddSwimClass: false,
      showAddBikeClass: false,
      showAddRunClass: false,
      showAddPowerClass: false,
      showAddNoteClass: false,
      showAddOtherClass: false,
      showAddRestClass: false,
      showSportTypeModal: false,
      showAddClassTitle: false,
      classModalData: { title: "", groupId: "" },
      classList: [], // 课程列表
      showAddGroup: false,
      currentGroup: { id: "", classesGroupName: "" },
      showMoveGroup: false,
      moveGroupId: "",
      moveClassId: "",
      moveType: "",
      classSearchInput: "",
      initScheduleData: null,
      showBindModal: false,
      bindExerciseData: [],
      bindCourseData: {},
      bindType: "",
      athleticInfoData: {},
      sthData: {},
      statisticData: [],
      showSportDetailModal: false,
      sportDetailData: {},
      showMonthStatisticDialog: false,
      currentMonth: "",
      showClassDetailModal: false,
      classSportType: "",
      classDetailData: {},
      loading: false,
      athleticThreshold: {
        run: 0,
        cycle: 0,
        swim: 0,
        heartRate: 0,
      },
      deviceTypeDict: {
        1: "高驰",
        2: "佳明国际",
        3: "佳明中国",
        4: "华米",
        5: "颂拓国际",
        6: "颂拓中国",
      },
      deviceTypeIconDict: {
        1: "C",
        2: "G",
        3: "G",
        4: "Z",
        5: "S",
        6: "S",
      },
      deviceList: [],
      currentActivityDict: {
        1: "CYCLE",
        2: "RUN",
        3: "SWIM",
        4: "STRENGTH",
        5: "OTHER",
      },
      classModalDataType: "",
    };
  },
  mounted() {
    // this.getClassList()
    this.getTeamAndAthleticData();
  },
  methods: {
    secondsToMMSS,
    // 课表同步设备点击
    handleDeviceClick(classItem, device, date) {
      if (date < new Date().toISOString().split("T")[0]) {
        this.$message.error("该课程已过期");
        return;
      }
      console.log("设备点击：", device);
      if (device.syncStatus === 1) {
        this.$message.info("该设备已同步成功");
        return;
      }
      this.$confirm("确定要重新同步该课表吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        submitData({
          url: `/api/classSchedule/retryClassScheduleSync?classScheduleId=${classItem.id}&deviceType=${device.deviceType}`,
        }).then((res) => {
          if (res.success) {
            this.$message.success(res.result);
            // 更新课表数据
            this.getScheduleData();
          } else {
            this.$message.error(res.message);
          }
        });
      });
    },
    // 获取用户已授权设备列表
    getAuthorizedDeviceList() {
      getData({
        url: "/api/classSchedule/authorizedDevice",
        triUserId: this.selectedAthletic,
      }).then((res) => {
        this.deviceList = (res.result || []).map((device) => ({
          ...device,
          enabled: device.syncFlag === 1, // 默认关闭状态
          deviceType: device.deviceType || 0,
        }));
      });
    },
    // 设备关闭或打开
    handleDeviceChange(item) {
      console.log("设备变化：", item);
      const syncFlag = item.enabled ? 1 : 0;
      submitData({
        url: `/api/classSchedule/updateAuthorizedDevice?deviceId=${item.id}&syncFlag=${syncFlag}`,
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.message);
          this.getAuthorizedDeviceList();
        }
      });
    },
    // 获取日程数据
    async getScheduleData() {
      if (!this.selectedAthletic) return;
      this.loading = true;
      const res = await getData({
        url: "/api/classSchedule/getCalenderOverview",
        begin: this.currentWeek[0].commonDate + " 00:00:00",
        end: this.currentWeek[6].commonDate + " 23:59:59",
        triUserId: this.selectedAthletic,
      });
      if (res.success && res.result) {
        this.getStatisticData();
        // 修复：将map的结果赋值回this.currentWeek
        this.initScheduleData = res.result;
        this.currentWeek = this.currentWeek.map((item) => {
          let activityList = [];
          let classSchedule = [];
          res.result.forEach((part) => {
            if (item.commonDate === part.dataDate) {
              activityList = (part.activityOverviewList || []).map((i) => {
                let completion = "";
                if (i.percent >= 80 && i.percent <= 120) {
                  completion = "green";
                } else if (i.percent < 60) {
                  completion = "shallowOrange";
                } else if (
                  (i.percent >= 60 && i.percent < 80) ||
                  i.percent > 120
                ) {
                  completion = "deepOrange";
                }
                return {
                  ...i,
                  classesJson: i.classesJson ? JSON.parse(i.classesJson) : "",
                  completion: i.classesJson ? completion : "",
                  distance: Math.round(i.distance / 100) / 10,
                };
              });
              classSchedule = (part.classScheduleVoList || [])
                .map((i) => {
                  return { ...i, classesJson: JSON.parse(i.classesJson) };
                })
                .filter((i) => !i.bindingActivityId);
            }
          });
          console.log(activityList, "activityList");
          console.log(classSchedule, "classSchedule");
          return {
            ...item,
            activityList,
            classSchedule,
            timesp: new Date().getTime(),
          };
        });
        console.log(this.currentWeek, "this.currentWeek");

        this.$nextTick(() => {
          document
            .querySelectorAll(".js-schedule-drag-container")
            .forEach((el) => {
              new Sortable(el, {
                group: { name: "classDrag" },
                animation: 150,
                filter: ".js-sport-container-noDrag",
                dataIdAttr: "data-id",
                onEnd: (e) => {
                  console.log("拖拽课程：", e.item.dataset.id);
                  console.log("拖拽日期：", e.to.dataset.date);
                  if (
                    e.item.dataset.date === e.to.dataset.date ||
                    !e.to.dataset.date
                  ) {
                    return;
                  }
                  submitData({
                    url: "/api/classSchedule/classBindingActivity",
                    requestData: {
                      classScheduleId: e.item.dataset.id,
                      classesDate: e.to.dataset.date,
                      triUserId: this.selectedAthletic,
                    },
                  })
                    .then((res) => {
                      if (res.success) {
                        this.$message.success("课表移动成功");
                      }
                    })
                    .finally(() => {
                      this.getScheduleData();
                    });
                },
              });
            });

          const _this = this;
          document.querySelectorAll(".js-sport-container-put").forEach((el) => {
            new Sortable(el, {
              sort: false,
              group: { name: "classDrag", pull: false },
              animation: 150,
              dataIdAttr: "data-id",
              onAdd(e) {
                console.log("课表id:" + e.item.dataset.id, e.item.dataset.type);
                console.log("运动id:" + e.to.dataset.id);
                if (!e.item.dataset.id || !e.to.dataset.id) {
                  return;
                }
                let currentClass = {};
                let currentActivity = {};
                let activityDate = "";
                _this.currentWeek.forEach((item) => {
                  item.activityList.forEach((activity) => {
                    if (activity.activityId === e.to.dataset.id) {
                      currentActivity = activity;
                      activityDate = item.commonDate;
                    }
                  });
                  item.classSchedule.forEach((classItem) => {
                    if (classItem.id === +e.item.dataset.id) {
                      currentClass = classItem;
                    }
                  });
                });
                // 判断是否从课程模板中拖拽
                if (e.item.dataset.type === "classTemplate") {
                  currentClass = _this.findClassById(e.item.dataset.id);
                  // alert("该逻辑待补充，暂时先新建课表再合并");
                  if (
                    currentClass.sportType ===
                    _this.currentActivityDict[currentActivity.sportType]
                  ) {
                    _this.handleBind(
                      currentClass,
                      {
                        ...currentActivity,
                        dataDate: activityDate,
                      },
                      "classTemplate"
                    );
                  } else {
                    _this.$message.error("该运动类型与课程类型不匹配");
                  }
                } else {
                  if (
                    currentClass.sportType ===
                    _this.currentActivityDict[currentActivity.sportType]
                  ) {
                    _this.handleBind(currentClass, {
                      ...currentActivity,
                      dataDate: activityDate,
                    });
                  } else {
                    _this.$message.error("该运动类型与课程类型不匹配");
                    // 刷新
                    _this.getScheduleData();
                  }
                }
              },
            });
          });
        });
      } else {
        console.error("获取日程数据失败:", res.message || "未知错误");
      }
      this.loading = false;
      console.log(this.loading, "this.loading");
    },
    // 获取课程列表
    getClassList() {
      getData({
        url: "/api/classes/getClassesByUserIdGroupedWithName",
        classesTitle: this.classSearchInput,
      }).then((res) => {
        if (res.success) {
          this.classList = res.result.map((item) => {
            return {
              timespan: new Date().getTime(),
              ...item,
              classesList: item.classesList.map((part) => {
                return {
                  ...part,
                  classesJson: JSON.parse(part.classesJson),
                };
              }),
            };
          });
          this.$nextTick(() => {
            this.classSlideChange();
          });
        } else {
          this.classList = [];
        }
      });
    },
    // 获取统计数据
    getStatisticData() {
      if (!this.selectedAthletic) return;
      getData({
        url: "/api/classSchedule/getStatistics",
        begin: this.currentWeek[0].commonDate,
        end: this.currentWeek[6].commonDate,
        triUserId: this.selectedAthletic,
      }).then((res) => {
        if (res.success) {
          this.statisticData = res.result.statisticsVoList.map((item) => {
            return {
              ...item,
              actualValue: unitConversion(
                item.actualValue,
                statisticKeyToTitle[item.key]?.unit
              ),
              title: statisticKeyToTitle[item.key]?.title,
              color: statisticKeyToTitle[item.key]?.color,
              icon: statisticKeyToTitle[item.key]?.icon,
              unit: statisticKeyToTitle[item.key]?.unit,
            };
          });
          this.sthData = res.result.avgSthRespDto;
        }
      });
    },
    // 获取运动员阈值
    getAthleticThreshold(id) {
      getData({
        url: "/api/classSchedule/getUserProfile",
        triUserId: id,
      }).then((res) => {
        res.result.thresholdRecordList.forEach((item) => {
          switch (item.thresholdType) {
            case 1:
              this.athleticThreshold.heartRate = item.threshold;
              break;
            case 2:
              this.athleticThreshold.cycle = item.threshold;
              break;
            case 3:
              this.athleticThreshold.run = item.threshold;
              break;
            case 4:
              this.athleticThreshold.swim = item.threshold;
              break;
          }
        });
      });
    },
    // 通过课程id查找课程
    findClassById(id) {
      let findClass = {};
      this.classList.forEach((item) => {
        item.classesList.forEach((part) => {
          if (part.id === +id) {
            findClass = part;
          }
        });
      });
      return findClass;
    },
    // 课程拖到日历中
    async AddScheduleClass(data, type = "") {
      if (!this.selectedAthletic) return;
      const originalClassesJson = JSON.parse(data.classesJson);
      console.log(originalClassesJson, "this.originalClassesJson", data);
      // 将运动员阈值代入课程中计算具体值
      // if (originalClassesJson.stages) {
      //   originalClassesJson.stages.forEach((item) => {
      //     item.sections.forEach((part) => {
      //       if (part.thresholdFtp) {
      //         part.thresholdFtpNum = Math.round(
      //           (part.thresholdFtp / 100) * this.athleticThreshold.cycle
      //         );
      //       }
      //       if (part.thresholdFtpRange) {
      //         part.thresholdFtpRangeNum = [
      //           Math.round(
      //             (part.thresholdFtpRange[0] / 100) *
      //               this.athleticThreshold.cycle
      //           ),
      //           Math.round(
      //             (part.thresholdFtpRange[1] / 100) *
      //               this.athleticThreshold.cycle
      //           ),
      //         ];
      //       }
      //       if (part.thresholdHeartRate) {
      //         part.thresholdHeartRateNum = Math.round(
      //           (part.thresholdHeartRate / 100) *
      //             this.athleticThreshold.heartRate
      //         );
      //       }
      //       if (part.thresholdHeartRateRange) {
      //         part.thresholdHeartRateRangeNum = [
      //           Math.round(
      //             (part.thresholdHeartRateRange[0] / 100) *
      //               this.athleticThreshold.heartRate
      //           ),
      //           Math.round(
      //             (part.thresholdHeartRateRange[1] / 100) *
      //               this.athleticThreshold.heartRate
      //           ),
      //         ];
      //       }
      //       if (part.thresholdSpeed) {
      //         part.thresholdSpeedNum = Math.round(
      //           (100 / part.thresholdSpeed) * this.athleticThreshold.run
      //         );
      //       }
      //       if (part.thresholdSpeedRange) {
      //         part.thresholdSpeedRangeNum = [
      //           Math.round(
      //             (100 / part.thresholdSpeedRange[0]) *
      //               this.athleticThreshold.run
      //           ),
      //           Math.round(
      //             (100 / part.thresholdSpeedRange[1]) *
      //               this.athleticThreshold.run
      //           ),
      //         ];
      //       }
      //     });
      //   });
      // }

      // data.classesJson =
      if (data.sportType === "RUN") {
        data.classesJson = new CalculateRun(
          this.athleticThreshold,
          originalClassesJson
        ).updateClassInfoCalculatedValues();
        // Avoid possible race condition by merging with latest data.classesJson if needed
      } else if (data.sportType === "CYCLE") {
        data.classesJson = new CalculateBike(
          this.athleticThreshold,
          originalClassesJson
        ).updateClassInfoCalculatedValues();
      }

      if (["RUN", "CYCLE"].includes(data.sportType)) {
        const res = await submitData({
          url: "/api/classSchedule/calculateTimeDistanceSth",
          requestData: {
            ...data,
            classesJson: JSON.stringify(data.classesJson),
            triUserId: this.selectedAthletic,
          },
        });
        // eslint-disable-next-line require-atomic-updates
        if (data.sportType === "RUN") {
          data.classesJson = {
            ...data.classesJson,
            duration: secondsToHHMMSS(res.result.time || 0),
            distance: (res.result.distance || 0) + "km",
            sth: res.result.sth,
          };
        } else if (data.sportType === "CYCLE") {
          data.classesJson = {
            ...data.classesJson,
            duration: data.classesJson.duration,
            distance: data.classesJson.distance,
            sth: res.result.sth,
          };
        }

        data.classesJson = JSON.stringify(data.classesJson);
      }

      if (type === "classTemplate") {
        console.log(data, "data");
        return data;
      }
      console.log(data, "data");
      submitData({
        url: "/api/classSchedule/create",
        requestData: { ...data, triUserId: this.selectedAthletic },
      }).then((res) => {
        if (res.success) {
          this.getScheduleData();
          this.getClassList();
        }
      });
    },
    // 删除课程
    handleDeleteClass(id) {
      this.$confirm("确认删除该课程？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classes/deleteClasses?id=" + id,
          }).then((res) => {
            if (res.success) {
              this.getClassList();
              this.$message.success("删除成功");
            }
          });
        })
        .catch(() => {});
    },
    // 删除课表
    handleDeleteClassSchedule(id) {
      this.$confirm("确认删除该课表？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classSchedule/deleteClassSchedule?id=" + id,
          }).then((res) => {
            if (res.success) {
              this.$message.success("删除成功");
              this.getScheduleData();
            }
          });
        })
        .catch(() => {});
    },
    onCancelSportDetail() {
      this.showSportDetailModal = false;
    },
    // 点击运动卡片，进入详情
    handleSportDetail(id, classScheduleId, sportType) {
      this.sportDetailData = { activityId: id, id: classScheduleId, sportType };
      this.showSportDetailModal = true;
    },
    handleTypeChange(val) {
      this.activeName = val;
    },
    handleDataTypeClick(tab, event) {
      this.dataLineType = tab.name;
    },
    // 解除匹配
    handleUnbind(id) {
      MessageBox.confirm("确定要将这条运动和课表解除匹配吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classSchedule/classUnbindActivity",
            requestData: { classScheduleId: id },
          }).then((res) => {
            if (res.success) {
              this.$message.success("解除匹配成功");
              this.getScheduleData();
            }
          });
        })
        .catch(() => {
          this.$message.info("已取消匹配");
        });
    },
    handleDeleteActivity(id) {
      this.$confirm("确认删除该运动？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classSchedule/deleteActivity",
            requestData: { activityId: id },
          }).then((res) => {
            if (res.success) {
              this.$message.success("删除成功");
              this.getScheduleData();
            }
          });
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    },
    // 获取团队和运动员下拉二级联动数据
    getTeamAndAthleticData() {
      getData({
        url: "/api/team/coach/all-teams",
      }).then((res) => {
        if (res.success) {
          this.teamList = res.result.map((item) => {
            return {
              id: item.id,
              name: item.teamName,
              members: item.members.map((member) => {
                return {
                  id: member.id,
                  name: member.userNickname,
                  triUserId: member.triUserId,
                };
              }),
            };
          });
          // 默认选中第一个团队
          if (this.teamList.length > 0) {
            this.selectedTeam = this.teamList[0].id;
            this.getAthleticList();
            this.getScheduleData();
          }
        }
      });
    },
    handleTeamChange(val) {
      this.selectedTeam = val;
      this.getAthleticList();
    },
    handleAthleticChange(val) {
      this.selectedAthletic = val;
      this.athleticInfoData = this.athleticList.find(
        (item) => item.triUserId === val
      );
      this.getScheduleData();
      this.getAthleticThreshold(val);
      this.getAuthorizedDeviceList();
    },
    getAthleticList() {
      this.athleticList = this.teamList.find(
        (item) => item.id === this.selectedTeam
      ).members;
      // 默认选中第一个运动员
      if (this.athleticList.length > 0) {
        this.selectedAthletic = this.athleticList[0].triUserId;
        this.athleticInfoData = this.athleticList[0];
        // 选中运动员后调用getClassList方法
        this.getClassList();
        this.getAthleticThreshold(this.selectedAthletic);
        this.getAuthorizedDeviceList();
      }
    },
    onWeekChange(payload) {
      // payload = { currentWeek: { list, monday, sunday }, nextWeek: { list, monday, sunday }, meta: { year, month, weekIndex } }
      console.log("当前周", payload.currentWeek.list);
      console.log("下一周", payload.nextWeek.list);
      this.currentWeek = payload.currentWeek.list.map((item) => {
        const date = getLunarDate(item);
        return {
          commonDate: item,
          lunarDate: date.fullName,
          date: item,
          activityList: [],
          classSchedule: [],
        };
      });

      // 计算currentWeek最后一天的月份
      if (this.currentWeek.length > 0) {
        const lastDay =
          this.currentWeek[this.currentWeek.length - 1].commonDate;
        const date = new Date(lastDay);
        this.currentMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      }

      this.getScheduleData();
    },
    onSaveAthleticInfo(payload) {
      // 这里对接保存接口
      console.log("保存人员信息：", payload);
    },
    onCancelMonthStatistic() {
      this.showMonthStatisticDialog = false;
    },
    onUpdate(e) {
      console.log("拖拽结束：", e);
    },
    onAdd(e) {
      console.log("添加结束：", e);
    },
    remove(e) {
      console.log("移除结束：", e);
    },
    handleClassMoreClick(e) {
      e.stopPropagation();
    },
    classSlideChange() {
      // 课程往课表中拖动
      document.querySelectorAll(".js-class-drag-container").forEach((el) => {
        new Sortable(el, {
          group: { name: "classDrag", put: false, pull: "clone" },
          animation: 150,
          dataIdAttr: "data-id",
          onEnd: (e) => {
            console.log("课程id:" + e.item.dataset.id);
            console.log("日期:" + e.to.dataset.date);
            if (e.item.dataset.id && e.to.dataset.date) {
              const classItem = this.findClassById(e.item.dataset.id);
              const params = {
                classesId: classItem.id,
                classesJson: JSON.stringify(classItem.classesJson),
                classesDate: e.to.dataset.date,
                sportType: classItem.sportType,
              };
              this.AddScheduleClass(params);
            }
          },
        });
      });
    },
    handleAddClass() {
      this.showAddClassTitle = true;
    },
    onSaveClassTitle(payload) {
      this.classModalData = { ...payload };
      this.showAddClassTitle = false;
      this.showSportTypeModal = true;
    },
    onSelectSportType(item) {
      this.classModalDataType = "add";
      switch (item.key) {
        case "swim":
          this.showAddSwimClass = true;
          break;
        case "strength":
          this.showAddPowerClass = true;
          break;
        case "note":
          this.showAddNoteClass = true;
          break;
        case "other":
          this.showAddOtherClass = true;
          break;
        case "rest":
          this.showAddRestClass = true;
          break;
        case "ride":
          this.showAddBikeClass = true;
          break;
        case "run":
          this.showAddRunClass = true;
      }

      this.showSportTypeModal = false;
    },
    onSaveAddSwimClass(payload) {
      console.log("保存泳课：", payload);
      this.getClassList();
    },
    onSaveAddBikeClass(payload) {
      console.log("保存骑行课：", payload);
      this.getClassList();
    },
    onSaveAddRunClass(payload) {
      console.log("保存跑步课：", payload);
      this.getClassList();
    },
    onSaveAddPowerClass(payload) {
      console.log("保存力量课：", payload);
      this.getClassList();
    },
    onSaveAddNoteClass(payload) {
      console.log("保存笔记课：", payload);
      this.getClassList();
    },
    onSaveAddOtherClass(payload) {
      console.log("保存其他课：", payload);
      this.getClassList();
    },
    onSaveAddRestClass(payload) {
      console.log("保存休息课：", payload);
      this.getClassList();
    },
    handleClassDetail(id, sportType) {
      console.log(sportType);
      this.classModalData.id = id;
      this.classModalDataType = "edit";
      switch (sportType) {
        case "SWIM":
          this.showAddSwimClass = true;
          break;
        case "CYCLE":
          this.showAddBikeClass = true;
          break;
        case "RUN":
          this.showAddRunClass = true;
          break;
        case "STRENGTH":
          this.showAddPowerClass = true;
          break;
        case "OTHER":
          this.showAddOtherClass = true;
          break;
        case "REMARK":
          this.showAddNoteClass = true;
          break;
        case "REST":
          this.showAddRestClass = true;
          break;
      }
    },
    onSaveAddGroup() {
      this.showAddGroup = false;
      this.getClassList();
    },
    handleAddGroup() {
      this.currentGroup = { id: "", classesGroupName: "" };
      this.showAddGroup = true;
    },
    handleEditGroup(id, groupName) {
      this.currentGroup = { id, classesGroupName: groupName };
      this.showAddGroup = true;
    },
    handleDeleteGroup(id) {
      this.$confirm("确认删除该分组？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classesGroup/deleteClassesGroup?id=" + id,
          }).then((res) => {
            if (res.success) {
              this.getClassList();
              this.$message.success("删除成功");
            }
          });
        })
        .catch(() => {});
    },
    handleMoveGroup(id) {
      this.moveGroupId = id;
      this.showMoveGroup = true;
      this.moveType = "group";
    },
    handleMoveClass(id, groupId) {
      this.moveGroupId = groupId;
      this.showMoveGroup = true;
      this.moveClassId = id;
      this.moveType = "class";
    },
    onSaveMoveGroup() {
      this.showMoveGroup = false;
      this.moveGroupId = "";
      this.moveClassId = "";
      this.moveType = "";
      this.getClassList();
    },
    // 显示匹配弹框
    showBindModalDialog(exerciseData, courseData, type) {
      this.bindExerciseData = exerciseData;
      this.bindCourseData = courseData;
      this.showBindModal = true;
      this.bindType = type || "";
    },
    // 匹配确认
    async onBind(data) {
      console.log("匹配数据：", data);
      if (data.type === "classTemplate") {
        const params = {
          classesId: data.courseData.id,
          classesJson: JSON.stringify(data.courseData.classesJson),
          classesDate: data.exerciseData.dataDate,
          sportType: data.courseData.classesJson.sportType,
        };
        const josnData = await this.AddScheduleClass(params, data.type);
        submitData({
          url: "/api/classSchedule/create",
          requestData: {
            ...josnData,
            bindingActivityId: data.exerciseData.id,
            triUserId: this.selectedAthletic,
          },
        }).then((res) => {
          if (res.success) {
            this.$message.success("匹配成功");
            this.getScheduleData();
          } else {
            this.$message.error(res.message);
            this.getScheduleData();
          }
        });
        return;
      }
      // 这里可以调用匹配API
      submitData({
        url: "/api/classSchedule/classBindingActivity",
        requestData: {
          classScheduleId: data.courseData.id,
          bindingActivityId: data.exerciseData.id,
          classesDate: data.exerciseData.dataDate,
          triUserId: this.selectedAthletic,
        },
      })
        .then((res) => {
          if (res.success) {
            this.$message.success("匹配成功");
            this.getScheduleData();
          } else {
            this.$message.error(res.message);
            this.getScheduleData();
          }
        })
        .finally(() => {
          this.getScheduleData();
        });
    },
    // 取消匹配
    onCancelBind() {
      this.showBindModal = false;
      this.getScheduleData();
    },
    // 处理匹配按钮点击
    handleBind(classItem, activityItem, type) {
      console.log("handleBind：", classItem, activityItem, type);
      // 模拟运动数据
      const exerciseData = {
        name: activityItem.activityName,
        duration: activityItem.duration,
        sth: activityItem.sthValue,
        id: activityItem.activityId,
        dataDate: activityItem.dataDate,
        distance: activityItem.distance,
      };
      // 模拟课程数据 - 这里可以从课程列表中选择
      const courseData = {
        name: classItem.classesJson.title,
        duration: classItem.classesJson.duration,
        sth: classItem.classesJson.sth,
        id: classItem.id,
        classesJson: classItem.classesJson,
        distance: classItem.classesJson.distance,
      };
      console.log("exerciseData：", exerciseData, activityItem);
      console.log("courseData：", courseData);

      this.showBindModalDialog(exerciseData, courseData, type);
    },
    // 进入课表详情
    handleClassSchedulaDetail(id, sportType, date) {
      console.log(sportType);
      this.classSportType = sportType;
      this.classDetailData = { id };
      this.$nextTick(() => {
        this.showClassDetailModal = true;
      });
    },
    // 关闭课表详情
    handleClassDetailSave(flag) {
      if (flag) {
        this.showClassDetailModal = false;
        this.classSportType = "";
        this.classDetailData = { id: "" };
      }
      this.getScheduleData();
    },
    // 获取运动icon 图片地址
    getSportImageIcon(sportType) {
      switch (sportType) {
        case 3:
          return require("@/assets/addClass/icon-swim.png");
        case 1:
          return require("@/assets/addClass/icon-bike.png");
        case 2:
          return require("@/assets/addClass/icon-run.png");
        case 4:
          return require("@/assets/addClass/icon-power.png");
        default:
          return require("@/assets/addClass/icon-other.png");
      }
    },
    // 获取课表icon 图片地址
    getClassImageIcon(sportType) {
      switch (sportType) {
        case "SWIM":
          return require("@/assets/addClass/icon-swim.png");
        case "CYCLE":
          return require("@/assets/addClass/icon-bike.png");
        case "RUN":
          return require("@/assets/addClass/icon-run.png");
        case "STRENGTH":
          return require("@/assets/addClass/icon-power.png");
        case "OTHER":
          return require("@/assets/addClass/icon-other.png");
        case "REMARK":
          return require("@/assets/addClass/icon-note.png");
        case "REST":
          return require("@/assets/addClass/icon-rest.png");
        default:
          return require("@/assets/addClass/icon-other.png");
      }
    },
    // 获取不同运动背景颜色
    getSportBackgroundColor(percent) {
      if (percent > 80 && percent <= 120) {
        return ["rgba(131, 223, 161, 1)", "rgba(131, 223, 161, 1)"];
      }
      if (
        (percent > 60 && percent <= 80) ||
        (percent > 120 && percent <= 145)
      ) {
        return ["rgba(247, 200, 134, 1)", "rgba(247, 200, 134, 1)"];
      }
      if ((percent > 0 && percent <= 60) || percent > 145) {
        return ["rgba(201, 143, 93, 1)", "rgba(201, 143, 93, 1)"];
      }
      if (percent === 0) {
        return ["rgba(199, 199, 199, 1)", "rgba(199, 199, 199, 1)"];
      }
      return ["rgba(199, 199, 199, 1)", "rgba(199, 199, 199, 1)"];
    },
  },
};
</script>
<style lang="scss" scoped>
.container {
  background-color: #fff;
}

.athletic-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;

  .schedule {
    flex: 1;
    background-color: #fff;
    padding: 10px;
  }
}

.schedule-search {
  display: flex;
  margin: 10px 0;
  gap: 10px;
  font-size: 12px;
}

.athletic-btn-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding-right: 8px;
}

.btn-list-hover {
  width: 60px;

  .el-button {
    margin-left: 0;
  }
}

.schedule-top {
  background-color: #f5f5f5;
  padding: 10px;
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}

.schedule-table {
  height: 100%;

  .schedule-table-header {
    display: flex;
    flex-direction: row;
    gap: 4px;
    background-color: #f5f5f5;

    .schedule-table-header-cell {
      flex: 1;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      line-height: 34px;
      background-color: #fde5e5;
    }
    .schedule-table-header-cell.active {
      background-color: #cc2323;
      color: #fff;
    }

    .schedule-table-header-cell:last-child {
      border-right: none;
    }
    .schedule-table-header-cell-data {
      background-color: #fff;
      padding: 0 10px;
      flex: 0 0 220px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex-wrap: wrap;
      justify-content: center;
      align-items: flex-start;
    }
  }
  .schedule-table-body {
    display: flex;
    gap: 4px;
    flex-direction: row;
    height: calc(100% - 34px);
    .schedule-table-cell {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 400px;
      width: 120px;
      background-color: #f5f5f5;
      .schedule-table-cell-title {
        font-size: 12px;
        text-align: center;
        line-height: 30px;
        background-color: #f8f8f8;
        margin: 4px 0;
      }
      .schedule-table-cell-item {
        flex: 1;
        font-size: 12px;
        line-height: 18px;
        color: #333;
        transition: all 0.3s ease;
        cursor: pointer;

        .schedule-class {
          display: none;
        }

        .js-sport-container-noDrag {
          .class-block {
            display: none;
          }
        }

        .sport-record {
          border: 1px solid #e5e5e5;
          transition: all 0.3s ease;
          margin-bottom: 5px;
          background-color: #fff;

          &:hover {
            // border-color: rgba(239, 18, 88, 0.3);
            // box-shadow: 0 2px 12px rgba(239, 18, 88, 0.2);
            transform: scale(1.02);
          }
          .sport-operate {
            height: 18px;
            background-color: #d0d0d0;
            padding: 0 10px;
            text-align: right;
            color: #fff;
            line-height: 18px;
          }
          .sport-record-data {
            padding: 5px;
          }
        }
        .sport-unmatched {
          .sport-operate {
            background-color: #d0d0d0;
          }
        }
        .green {
          .sport-operate {
            background-color: #83dfa1;
          }
        }
        .shallowOrange {
          .sport-operate {
            background-color: #ffd18d;
          }
        }
        .deepOrange {
          .sport-operate {
            background-color: #dc8605;
          }
        }
        .class-block {
          position: relative;
          padding: 10px 5px 5px 5px;
          border: 1px solid #e5e5e5;
          transition: all 0.3s ease;
          margin-bottom: 5px;
          &:hover {
            // border-color: rgba(239, 18, 88, 0.3);
            // box-shadow: 0 2px 12px rgba(239, 18, 88, 0.2);
            transform: scale(1.02);
          }
        }
      }
    }
    .schedule-table-cell:last-child {
      border-right: none;
    }
    .schedule-table-cell-data {
      flex: 0 0 220px;
      padding: 10px;
    }
  }
}

.week-data-sth {
  display: flex;
  flex-direction: row;
  gap: 2px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  > div {
    width: 60px;
    text-align: center;
    color: #fff;
    font-size: 12px;
    line-height: 22px;
    display: flex;
    flex-direction: column;

    span:nth-child(1) {
      background-color: rgba(255, 255, 255, 0.46);
    }
  }
  > div:nth-child(1) {
    padding: 4px 0 0 4px;
    border-radius: 6px 0 0 6px;
    background-color: rgba(93, 187, 246, 1);
    span:nth-child(1) {
      border-radius: 6px 0 0 6px;
    }
  }
  > div:nth-child(2) {
    padding: 4px 4px 6px 4px;
    border-radius: 6px;
    background-color: rgba(204, 35, 35, 1);
    span:nth-child(1) {
      border-radius: 6px;
    }
  }
  > div:nth-child(3) {
    padding: 4px 4px 0 0;
    border-radius: 0 6px 6px 0;
    background-color: rgba(255, 181, 105, 1);
    span:nth-child(1) {
      border-radius: 0 6px 6px 0;
    }
  }
}

.week-data-item {
  .week-data-text {
    display: flex;
    flex-direction: row;
    div {
      text-align: right;
    }
    span,
    div {
      flex: 1;
      font-size: 12px;
      color: #333;
      span:nth-child(2) {
        color: #999;
      }
    }
    > span {
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      color: #000000;
    }
  }
}

.type-change {
  width: 260px;
  background-color: #f8f8f8;
}
.type-change-list {
  list-style: none;
  padding: 10px 0;
  min-width: 250px;
  //width: 370px;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  > li {
    width: 80px;
    cursor: pointer;
    line-height: 28px;
    border-radius: 6px;
    background-color: #fff;
    font-size: 14px;
    text-align: center;
    color: #333;
    transition: all 0.3s ease;
    &:hover {
      background-color: rgba(239, 18, 88, 0.1);
    }
    &.active {
      background-color: #cc2323;
      color: #fff;
    }
  }
}

.class-container {
  padding: 10px;
}
.schedule-class-container {
  padding: 10px 10px;
  background-color: #fff;

  .schedule-class-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 200px;
    padding: 0 10px;
    .group-name {
      // 文本超出 以...
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 80%;
    }
  }
}
.schedule-class {
  background-color: #f8f8f8;
  margin-bottom: 10px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;

  .schedule-class-info-item-title {
    display: flex;
    gap: 6px;

    > span {
      flex: 1;
    }
    .delete {
      display: none;
    }
  }
  &:hover .schedule-class-info-item-title .delete {
    display: block;
  }
}

.class-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}
.class-operation {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.schedule-class-info-item-content {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  img {
    width: 20px;
  }
}
.class-block-title-delete {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  padding: 3px;
  cursor: pointer;
}
.class-block:hover .class-block-title-delete {
  display: block;
}

.sportScheduleCard {
  .classScheduleCard {
    display: none;
  }
}

.classScheduleCard {
  margin-left: 2px;
  margin-right: 2px;
  position: relative;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  overflow: hidden;
  &:hover {
    transform: scale(1.02);
  }
  border-radius: 6px;
  background-color: #ffffff;
  padding-top: 10px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.75);
  .card-body {
    width: 100%;
    padding-left: 2px;
    padding-right: 2px;
    padding-bottom: 5px;
    .body-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      background-color: white;
      padding: 5px 3px;
      .sport-type-icon {
        display: flex;
        align-content: center;
        .sport-type-name {
          width: 15px;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-left: 5px;
          font-weight: 700;
          color: #fff;
        }
        .sport-type-color1 {
          background-color: #7fb135;
        }
        .sport-type-color2 {
          background-color: #c72a29;
        }
        .sport-type-color0 {
          background-color: #aaaaaa;
        }
      }
    }
    .stage-details {
      font-size: 12px;
      color: #999;
      padding: 5px 5px 0;
      line-height: 16px;
      .stage-item {
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e5e5e5;
      }
      .stage-item:last-child {
        border-bottom: none;
      }
    }
  }
  .image-icon {
    width: 20px;
  }
  .title {
    font-size: 14px;
    font-weight: bold;
  }
  .keyword {
    font-size: 12px;
    font-weight: bold;
  }
}
</style>
