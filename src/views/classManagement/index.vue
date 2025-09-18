<template>
  <div class="container">
      <div class="schedule-top">
          <WeekRangePicker @week-change="onWeekChange" />
          <div class="schedule-search">
              <div>
                  <span>团队选择：</span>
                  <el-select v-model="selectedTeam" size="mini" placeholder="选择团队" @change="handleTeamChange">
                      <el-option
                          v-for="t in teamList"
                          :key="t.id"
                          :label="t.name"
                          :value="t.id"
                      />
                  </el-select>
              </div>
              <div>
                  <span>人员选择：</span>
                  <el-select v-model="selectedAthletic" size="mini" placeholder="选择人员" @change="handleAthleticChange">
                      <el-option
                          v-for="t in athleticList"
                          :key="t.triUserId"
                          :label="t.name"
                          :value="t.triUserId"
                      />
                  </el-select>
              </div>
              <el-button type="text" size="mini" :disabled="!athleticInfoData.triUserId" @click="showAthleticInfoDialog = true">人员信息查看</el-button>
              <el-button type="text" size="mini" :disabled="!athleticInfoData.triUserId" @click="showMonthStatisticDialog = true">月度统计</el-button>
          </div>
      </div>
      <div class="athletic-container">
          <div class="type-change">
              <ul class="type-change-list">
                  <li :class="activeName === 'athletic' ? 'active' : ''" @click="handleTypeChange('athletic')">运动员</li>
                  <li :class="activeName === 'class' ? 'active' : ''" @click="handleTypeChange('class')">课程</li>
              </ul>
              <div v-if="activeName === 'athletic'">
                  <AthleticManagement :teamId="selectedTeam"></AthleticManagement>
              </div>
              <div v-else class="class-container">
                  <div class="class-title">课程</div>
                  <div class="class-operation">
                      <el-button type="primary" size="mini" @click="handleAddClass">新增课程</el-button>
                      <el-input size="mini" v-model="classSearchInput">
                          <el-button slot="append" icon="el-icon-search" @click="getClassList"></el-button>
                      </el-input>
                  </div>
                  <div class="schedule-class-container">
                      <el-collapse accordion @change="classSlideChange">
                          <el-collapse-item v-for="item in classList" :key="item.groupId">
                              <template slot="title">
                                  <div class="schedule-class-title">
                                      <span>{{ item.groupName }}</span>
                                      <el-popover popper-class="athletic-btn-popover" placement="right" width="80" trigger="click">
                                          <div style="display: flex;flex-direction: column;align-items: center;">
                                              <span><el-button type="text" @click="handleAddGroup">新建分组</el-button></span>
                                              <span><el-button type="text" :disabled="!item.groupId" @click="handleEditGroup(item.groupId, item.groupName)">编辑分组</el-button></span>
                                              <span><el-button type="text" :disabled="!item.groupId" @click="handleDeleteGroup(item.groupId)">删除分组</el-button></span>
                                              <span><el-button type="text" :disabled="!item.groupId" @click="handleMoveGroup(item.groupId)">移动分组</el-button></span>
                                          </div>
                                          <i class="el-icon-more" slot="reference" @click.stop="handleClassMoreClick"></i>
                                      </el-popover>
                                  </div>
                              </template>
                              <div class="class-drag-container" :key="item.timespan" style="min-height: 20px;">

                                  <div v-for="part in item.classesList" :key="part.id" class="schedule-class" :data-id="part.id" data-type="classTemplate" @click="handleClassDetail(part.id, part.sportType)">
                                      <div class="schedule-class-info">
                                          <div class="schedule-class-info-item-title">
                                              <span>{{ part.classesJson.title }}</span>
                                              <div class="delete" @click.stop="handleDeleteClass(part.id)"><i class="el-icon-delete"></i></div>
                                          </div>
                                          <div class="schedule-class-info-item-content">
                                              <span v-if="part.sportType === 'SWIM'">
                                                  <img src="~@/assets/addClass/icon-swim.png" alt="">
                                              </span>
                                              <span v-else-if="part.sportType === 'CYCLE'">
                                                  <img src="~@/assets/addClass/icon-bike.png" alt="">
                                              </span>
                                              <span v-else-if="part.sportType === 'RUN'">
                                                  <img src="~@/assets/addClass/icon-run.png" alt="">
                                              </span>
                                              <span v-else-if="part.sportType === 'STRENGTH'">
                                                  <img src="~@/assets/addClass/icon-power.png" alt="">
                                              </span>
                                              <span v-else>
                                                  <img src="~@/assets/addClass/icon-other.png" alt="">
                                              </span>
                                              <span>{{ part.classesJson.duration }}</span>
                                              <span>{{ part.classesJson.distance }}km</span>
                                          </div>
                                      </div>
                                      <div v-if="part.classesJson.timeline" style="height: 16px;display: flex;gap:2px;">
                                          <div v-for="(i, index) in part.classesJson.timeline" :key="index" class="time-stage" :style="{flex: i.duration}">
                                              <div :style="{display: 'flex', gap: '2px', height: '16px'}">
                                                  <div v-for="n in i.times" :key="n" :style="{flex: 1}">
                                                      <ExerciseProcessChart :exerciseList="i.stageTimeline" :maxIntensity="part.classesJson.maxIntensity" :height="16" />
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

          <div class="schedule">
              <div class="schedule-table">
                  <div class="schedule-table-header">
                      <div v-for="item in weekList" :key="item.id" class="schedule-table-header-cell">{{ item.name }}</div>
                      <div class="schedule-table-header-cell-data">周统计</div>
                  </div>
                  <div class="schedule-table-body">
                      <div v-for="item in currentWeek" :key="item.timesp" class="schedule-table-cell">
                          <div class="schedule-table-cell-title">{{ item?.commonDate }}</div>
                          <div class="schedule-table-cell-item schedule-drag-container" :data-date="item.commonDate">
                              <!-- 运动循环 -->
                              <div v-for="activityItem in item.activityList"
                                   :key="activityItem.activityId"
                                   class="classScheduleCard"
                                   :style="{backgroundColor: getSportBackgroundColor(activityItem.percent)[1]}"
                                   :data-id="activityItem.activityId">
                                  <div class="card-body" :style="{backgroundColor: getSportBackgroundColor(activityItem.percent)[0]}">
                                    <div class="body-title" :style="{backgroundColor: getSportBackgroundColor(activityItem.percent)[0]}">
                                      <img class="image-icon" :src="getSportImageIcon(activityItem.sportType)" alt="">
                                      <el-popover popper-class="athletic-btn-popover" placement="right" trigger="click">
                                        <div class="btn-list-hover">
                                          <el-button v-if="activityItem.classesJson" type="text" @click="handleUnbind(activityItem.classScheduleId)">解绑</el-button>
                                          <el-button v-if="!activityItem.classesJson" type="text" @click="handleDeleteActivity(activityItem.activityId)">删除</el-button>
                                        </div>
                                        <i class="el-icon-more" slot="reference"></i>
                                      </el-popover>
                                    </div>

                                      <div class="sport-record-data" @click="handleSportDetail(activityItem.activityId, activityItem.classScheduleId, activityItem.sportType)">
                                          <div class="title">{{ activityItem.activityName }}</div>
                                          <div class="keyword">{{ activityItem.duration }}</div>
                                        <div style="display:flex; "><div class="keyword">{{ activityItem.distance }} </div><div>&nbsp;&nbsp;KM</div></div>
                                        <div style="display:flex; "><div class="keyword">{{ activityItem.sthValue }} </div><div>&nbsp;&nbsp;STH</div></div>
                                      </div>
                                  </div>
                              </div>
                              <!-- 课表循环 -->
                              <div v-for="classItem in item.classSchedule"
                                   :key="classItem.id" class="classScheduleCard"
                                   style="background-color: #a9adb5"
                                   :data-id="classItem.id" :data-date="item.commonDate" @click="handleClassSchedulaDetail(classItem.id, classItem.classesJson.sportType)">

                                  <div class="card-body" style="background-color: white">
                                    <div class="body-title">
                                      <img class="image-icon" :src="getSportImageIcon(classItem.sportType)" alt="">
                                      <i class="el-icon-delete" @click.stop="handleDeleteClassSchedule(classItem.id)"></i>
                                    </div>
                                    <div class="title">{{ classItem.classesJson.title }}</div>
                                    <div class="keyword">{{ classItem.classesJson.sportType }}</div>
                                    <div class="keyword">{{ classItem.classesJson.duration }}</div>
                                    <div style="display:flex; "><div class="keyword">{{ classItem.classesJson.distance }} </div><div>&nbsp;&nbsp;KM</div></div>
                                    <div style="display:flex; "><div class="keyword">{{ classItem.classesJson.sth }} </div><div>&nbsp;&nbsp;STH</div></div>
                                    <div v-if="classItem.classesJson.timeline" style="height: 16px;display: flex;gap:2px;">
                                      <div v-for="(i, index) in classItem.classesJson.timeline" :key="index" class="time-stage" :style="{flex: i.duration}">
                                        <div :style="{display: 'flex', gap: '2px', height: '16px'}">
                                          <div v-for="n in i.times" :key="n" :style="{flex: 1}">
                                            <ExerciseProcessChart :exerciseList="i.stageTimeline" :maxIntensity="classItem.classesJson.maxIntensity" :height="16" />
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
                              <span>{{ sthData.avgBalanceBig ? sthData.avgBalanceBig - sthData.avgBalanceSmall : 0 }}</span>
                              <span>STH平衡</span>
                            </div>
                          </div>
                          <div v-for="item in statisticData" :key="item.title" class="week-data-item">
                              <div class="week-data-text">
                                  <div style="display: flex; align-items: center">
                                    <img v-if="item.icon" style="width: 20px;margin-right: 10px" :src="item.icon" alt="">
                                    <p>{{ item.title }}:</p>
                                    <div style="display: flex; align-items: center; justify-content: space-between">
                                      <span>{{ item.actualValue }} {{ item.unit }}</span>
                                      <span>{{ item.planValue }} {{ item.unit }}</span>
                                    </div>
                                  </div>

                              </div>
                              <el-progress :percentage="item.percent || 0" :color="item.color" :show-text="false"></el-progress>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <AthleticInfoDialog v-model="showAthleticInfoDialog" :data="athleticInfoData" @save="onSaveAthleticInfo" />
      <MonthStatisticDialog v-model="showMonthStatisticDialog" :triUserId="selectedAthletic" :currentMonth="currentMonth" @cancel="onCancelMonthStatistic" />
      <SportTypeModal v-model="showSportTypeModal" :data="classModalData" @select="onSelectSportType" />
      <SportDetailModal v-model="showSportDetailModal" :type="sportDetailData.sportType" :data="sportDetailData" @cancel="onCancelSportDetail" />
      <AddSwimClass v-model="showAddSwimClass" :data="classModalData" @save="onSaveAddSwimClass" />
      <AddRunClass v-model="showAddRunClass" :data="classModalData" @save="onSaveAddRunClass" />
      <AddBikeClass v-model="showAddBikeClass" :data="classModalData" @save="onSaveAddBikeClass" />
      <AddPowerClass v-model="showAddPowerClass" :data="classModalData" @save="onSaveAddPowerClass" />
      <AddNoteClass v-model="showAddNoteClass" :data="classModalData" @save="onSaveAddNoteClass" />
      <AddOtherClass v-model="showAddOtherClass" :data="classModalData" @save="onSaveAddOtherClass" />
      <AddRestClass v-model="showAddRestClass" :data="classModalData" @save="onSaveAddRestClass" />
      <AddClassTitle v-model="showAddClassTitle" :groups="[{id: 1, name: '我的课程'}, {id: 2, name: '团队课程'}]" @save="onSaveClassTitle" />
      <AddGroup v-model="showAddGroup" :data="currentGroup" @save="onSaveAddGroup"></AddGroup>
      <MoveGroup v-model="showMoveGroup" :id="moveGroupId" @save="onSaveMoveGroup"></MoveGroup>
      <BindModal v-model="showBindModal" :exercise-data="bindExerciseData" :course-data="bindCourseData" @bind="onBind" @cancel="onCancelBind"></BindModal>
      <ClassDetailModal v-model="showClassDetailModal" :type="classSportType" :data="classDetailData" @save="handleClassDetailSave"></ClassDetailModal>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
import WeekRangePicker from '@/components/WeekRangePicker'
import AthleticInfoDialog from '@/views/classManagement/components/AthleticInfo'
import MonthStatisticDialog from '@/views/classManagement/components/MonthStatistic'
import ExerciseProcessChart from '@/components/ExerciseProcessChart'
import AthleticManagement from '@/views/classManagement/components/AthleticManagement'
import AddSwimClass from '@/views/classManagement/components/AddSwimClass'
import AddPowerClass from '@/views/classManagement/components/AddPowerClass'
import AddNoteClass from '@/views/classManagement/components/AddNoteClass'
import AddOtherClass from '@/views/classManagement/components/AddOtherClass'
import AddBikeClass from '@/views/classManagement/components/AddBikeClass'
import AddRunClass from '@/views/classManagement/components/AddRunClass'
import AddRestClass from '@/views/classManagement/components/AddRestClass'
import SportTypeModal from '@/views/classManagement/components/SportTypeModal'
import AddClassTitle from '@/views/classManagement/components/AddClassTitle'
import AddGroup from '@/views/classManagement/components/AddGroup'
import MoveGroup from '@/views/classManagement/components/MoveGroup'
import BindModal from '@/views/classManagement/components/BindModal'
import SportDetailModal from '@/views/classManagement/components/SportDetailModal'
import ClassDetailModal from './components/ClassDetailModal'
import { getLunarDate, secondsToHHMMSS } from '@/utils/index'
import {getData, submitData} from '@/api/common.js'
import { MessageBox } from 'element-ui'

const statisticKeyToTitle = {
  totalTime: {
    title: '总时长',
    color: 'rgba(217, 206, 185, 1)'
  },
  totalDistanceKm: {
    title: '总距离',
    unit: 'kcal',
    color: 'rgba(217, 206, 185, 1)'
  },
  totalCalories: {
    title: '总消耗',
    unit: 'KM',
    color: 'rgba(217, 206, 185, 1)'
  },
  totalSTH: {
    title: '总STH',
    unit: 'W',
    color: 'rgba(204, 35, 35, 1)'
  },
  runTime: {
    title: '跑步时间',
    icon: require('@/assets/addClass/icon-run.png'),
    color: 'rgba(255, 21, 82, 1)'
  },
  runDistanceKm: {
    title: '跑步距离',
    unit: 'KM',
    color: 'rgba(255, 21, 82, 1)'
  },
  cycleTime: {
    title: '骑车时间',
    icon: require('@/assets/addClass/icon-bike.png'),
    color: 'rgba(134, 91, 214, 1)'
  },
  cycleDistanceKm: {
    title: '骑车距离',
    unit: 'KM',
    color: 'rgba(134, 91, 214, 1)'
  },
  swimTime: {
    title: '游泳时间',
    icon: require('@/assets/addClass/icon-swim.png'),
    color: 'rgba(46, 166, 223, 1)'
  },
  swimDistanceKm: {
    title: '游泳距离',
    unit: 'KM',
    color: 'rgba(46, 166, 223, 1)'
  },
  strengthTime: {
    title: '力量',
    icon: require('@/assets/addClass/icon-power.png'),
    color: 'rgba(163, 163, 163, 1)'
  },
  otherTime: {
    title: '其他',
    icon: require('@/assets/addClass/icon-other.png'),
    color: 'rgba(163, 163, 163, 1)'
  }
}

export default {
  name: "ClassManagement",
  components: { WeekRangePicker, AthleticInfoDialog, MonthStatisticDialog, ExerciseProcessChart, AthleticManagement, AddSwimClass, AddBikeClass, AddRunClass, AddPowerClass, AddNoteClass, AddOtherClass, AddRestClass, SportTypeModal, AddClassTitle, AddGroup, MoveGroup, BindModal, SportDetailModal, ClassDetailModal },
  data() {
    return {
      activeName: "athletic",
      dataLineType: 'week',
      teamList: [],
      athleticList: [],
      selectedAthletic: null,
      selectedTeam: null,
      weekList: [
        {id: 1, name: '周一'},
        {id: 2, name: '周二'},
        {id: 3, name: '周三'},
        {id: 4, name: '周四'},
        {id: 5, name: '周五'},
        {id: 6, name: '周六'},
        {id: 7, name: '周日'}
      ],
      currentWeekClass: [
        {id: 1, name: '课程1'},
        {id: 2, name: '课程2'}
      ],
      nextWeekClass: [
        {id: 1, name: '课程1'},
        {id: 2, name: '课程2'}
      ],
      showAthleticInfoDialog: false,
      currentWeek: [],
      nextWeek: [],
      basicExerciseList: [
        { duration: 30, intensity: 80 }, // 30分钟，强度80%
        { duration: 45, intensity: 60 }, // 45分钟，强度60%
        { duration: 20, intensity: 90 } // 20分钟，强度90%
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
      classModalData: { title: '', groupId: '' },
      classList: [], // 课程列表
      showAddGroup: false,
      currentGroup: {id: '', classesGroupName: ''},
      showMoveGroup: false,
      moveGroupId: '',
      classSearchInput: '',
      initScheduleData: null,
      showBindModal: false,
      bindExerciseData: [],
      bindCourseData: {},
      athleticInfoData: {},
      sthData: {},
      statisticData: [],
      showSportDetailModal: false,
      sportDetailData: {},
      showMonthStatisticDialog: false,
      currentMonth: '',
      showClassDetailModal: false,
      classSportType: '',
      classDetailData: {}
    }
  },
  mounted() {
    this.getClassList()
    this.getTeamAndAthleticData()
  },
  methods: {
  // 获取日程数据
    getScheduleData() {
      if (!this.selectedAthletic) return;

      getData({
        url: '/api/classSchedule/getCalenderOverview',
        begin: this.currentWeek[0].commonDate + ' 00:00:00',
        end: this.currentWeek[6].commonDate + ' 23:59:59',
        triUserId: this.selectedAthletic
      }).then(res => {
        if (res.success && res.result) {
          this.getStatisticData()
          // 修复：将map的结果赋值回this.currentWeek
          this.initScheduleData = res.result
          this.currentWeek = this.currentWeek.map(item => {
            let activityList = []
            let classSchedule = []
            res.result.forEach(part => {
              if (item.commonDate === part.dataDate) {
                activityList = (part.activityOverviewList || []).map(i => {
                  let completion = ''
                  if (i.percent >= 80 && i.percent <= 120) {
                    completion = 'green'
                  } else if (i.percent < 60) {
                    completion = 'shallowOrange'
                  } else if (i.percent >= 60 && i.percent < 80 || i.percent > 120) {
                    completion = 'deepOrange'
                  }
                  return {...i, completion: i.classesJson ? completion : '', distance: Math.round(i.distance / 100) / 10}
                })
                classSchedule = (part.classScheduleVoList || []).map(i => {
                  return {...i, classesJson: JSON.parse(i.classesJson)}
                }).filter(i => !i.bindingActivityId)
              }
            })
            return {...item, activityList, classSchedule, timesp: new Date().getTime()}
          })

          this.$nextTick(() => {
            document.querySelectorAll('.schedule-drag-container').forEach(el => {
              new Sortable(el, {
                group: {name: 'classDrag'},
                animation: 150,
                filter: '.sport-container-noDrag',
                dataIdAttr: 'data-id',
                onEnd: (e) => {
                  console.log('拖拽课程：', e.item.dataset.id)
                  console.log('拖拽日期：', e.to.dataset.date)
                  if (e.item.dataset.date === e.to.dataset.date || !e.to.dataset.date) return;
                  submitData({
                    url: '/api/classSchedule/classBindingActivity',
                    requestData: {classScheduleId: e.item.dataset.id , classesDate: e.to.dataset.date}
                  }).then(res => {
                    if (res.success) {
                      this.$message.success('课表移动成功')
                    }
                  }).finally(() => {
                    this.getScheduleData()
                  })
                }
              });
            });

            const _this = this
            document.querySelectorAll('.sport-container-put').forEach(el => {
              new Sortable(el, {
                sort: false,
                group: {name: 'classDrag', pull: false},
                animation: 150,
                dataIdAttr: 'data-id',
                onAdd(e) {
                  console.log('课表id:' + e.item.dataset.id)
                  console.log('运动id:' + e.to.dataset.id)
                  if (!e.item.dataset.id || !e.to.dataset.id) {
                    return
                  }
                  let currentClass = {}
                  let currentActivity = {}
                  let activityDate = ''
                  _this.currentWeek.forEach(item => {
                    item.activityList.forEach(activity => {
                      if (activity.activityId === e.to.dataset.id) {
                        currentActivity = activity
                        activityDate = item.commonDate
                      }
                    })
                    item.classSchedule.forEach(classItem => {
                      if (classItem.id === +e.item.dataset.id) {
                        currentClass = classItem
                      }
                    })
                  })
                  // 判断是否从课程模板中拖拽
                  if (e.item.dataset.type === 'classTemplate') {
                    alert('该逻辑待补充，暂时先新建课表再合并')
                  } else {
                    _this.handleBind(currentClass, {...currentActivity, dataDate: activityDate})
                  }
                }
              });
            });
          })
        } else {
          console.error('获取日程数据失败:', res.message || '未知错误')
        }
      }).catch(error => {
        console.error('API调用失败:', error)
      })
    },
    // 获取课程列表
    getClassList() {
      getData({
        url: '/api/classes/getClassesByUserIdGroupedWithName',
        classesTitle: this.classSearchInput
      }).then(res => {
        if (res.success) {
          this.classList = res.result.map(item => {
            return {
              timespan: new Date().getTime(),
              ...item,
              classesList: item.classesList.map(part => {
                return {
                  ...part,
                  classesJson: JSON.parse(part.classesJson)
                }
              })
            }
          })
          this.$nextTick(() => {
            this.classSlideChange()
          })
        } else {
          this.classList = []
        }
      })
    },
    // 获取统计数据
    getStatisticData() {
      if (!this.selectedAthletic) return;
      getData({
        url: '/api/classSchedule/getStatistics',
        begin: this.currentWeek[0].commonDate,
        end: this.currentWeek[6].commonDate,
        triUserId: this.selectedAthletic
      }).then(res => {
        if (res.success) {
          this.statisticData = res.result.statisticsVoList.map(item => {
            return {
              ...item,
              title: statisticKeyToTitle[item.key]?.title,
              color: statisticKeyToTitle[item.key]?.color,
              icon: statisticKeyToTitle[item.key]?.icon,
              unit: statisticKeyToTitle[item.key]?.unit
            }
          })
          this.sthData = res.result.avgSthRespDto
        }
      })
    },
    // 通过课程id查找课程
    findClassById(id) {
      let findClass = {}
      this.classList.forEach(item => {
        item.classesList.forEach(part => {
          if (part.id === +id) {
            findClass = part
          }
        })
      })
      return findClass
    },
    // 课程拖到日历中
    async AddScheduleClass(data) {
      if (!this.selectedAthletic) return;
      const originalClassesJson = data.classesJson;
      const res = await submitData({
        url: '/api/classSchedule/calculateTimeDistanceSth',
        requestData: {...data, triUserId: this.selectedAthletic}
      })
      // eslint-disable-next-line require-atomic-updates
      data.classesJson = JSON.stringify({ ...JSON.parse(originalClassesJson), duration: secondsToHHMMSS(res.result.time), distance: res.result.distance + 'km', sth: res.result.sth })
      submitData({
        url: '/api/classSchedule/create',
        requestData: {...data, triUserId: this.selectedAthletic}
      }).then(res => {
        if (res.success) {
          this.getScheduleData()
          this.getClassList()
        }
      })
    },
    // 删除课程
    handleDeleteClass(id) {
      this.$confirm('确认删除该课程？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitData({
          url: '/api/classes/deleteClasses?id=' + id
        }).then(res => {
          if (res.success) {
            this.getClassList()
            this.$message.success('删除成功')
          }
        })
      }).catch(() => {})
    },
    // 删除课表
    handleDeleteClassSchedule(id) {
      this.$confirm('确认删除该课表？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitData({
          url: '/api/classSchedule/deleteClassSchedule?id=' + id
        }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.getScheduleData()
          }
        })
      }).catch(() => {})
    },
    onCancelSportDetail() {
      this.showSportDetailModal = false
    },
    // 点击运动卡片，进入详情
    handleSportDetail(id, classScheduleId, sportType) {
      this.sportDetailData = {activityId: id, id: classScheduleId, sportType}
      this.showSportDetailModal = true
    },
    handleTypeChange(val) {
      this.activeName = val
    },
    handleDataTypeClick(tab, event) {
      this.dataLineType = tab.name
    },
    // 解绑
    handleUnbind(id) {
      MessageBox.confirm('确定要将这条运动和课表解绑吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitData({
          url: '/api/classSchedule/classUnbindActivity',
          requestData: {classScheduleId: id}
        }).then(res => {
          if (res.success) {
            this.$message.success('解绑成功')
            this.getScheduleData()
          }
        })
      }).catch(() => {
        this.$message.info('已取消解绑')
      })
    },
    handleDeleteActivity(id) {
      this.$confirm('确认删除该运动？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitData({
          url: '/api/classSchedule/deleteActivity',
          requestData: {activityId: id}
        }).then(res => {
          if (res.success) {
            this.$message.success('删除成功')
            this.getScheduleData()
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 获取团队和运动员下拉二级联动数据
    getTeamAndAthleticData() {
      getData({
        url: '/api/team/coach/all-teams'
      }).then(res => {
        if (res.success) {
          this.teamList = res.result.map(item => {
            return {id: item.id, name: item.teamName, members: item.members.map(member => {
              return {id: member.id, name: member.userNickname, triUserId: member.triUserId}
            })}
          })
        // this.selectedTeam = this.teamList[0].id
        // this.getAthleticList()
        }
      })
    },
    handleTeamChange(val) {
      this.selectedTeam = val
      this.getAthleticList()
    },
    handleAthleticChange(val) {
      this.selectedAthletic = val
      this.athleticInfoData = this.athleticList.find(item => item.triUserId === val)
      this.getScheduleData()
    },
    getAthleticList() {
      this.athleticList = this.teamList.find(item => item.id === this.selectedTeam).members
    // this.selectedAthletic = this.athleticList[0].triUserId
    // this.athleticInfoData = this.athleticList[0]
    },
    onWeekChange(payload) {
    // payload = { currentWeek: { list, monday, sunday }, nextWeek: { list, monday, sunday }, meta: { year, month, weekIndex } }
      console.log('当前周', payload.currentWeek.list)
      console.log('下一周', payload.nextWeek.list)
      this.currentWeek = payload.currentWeek.list.map(item => {
        const date = getLunarDate(item)
        return {commonDate: item, lunarDate: date.fullName, date: item, activityList: [], classSchedule: []}
      })

      // 计算currentWeek最后一天的月份
      if (this.currentWeek.length > 0) {
        const lastDay = this.currentWeek[this.currentWeek.length - 1].commonDate
        const date = new Date(lastDay)
        this.currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      this.getScheduleData()
    },
    onSaveAthleticInfo(payload) {
    // 这里对接保存接口
      console.log('保存人员信息：', payload)
    },
    onCancelMonthStatistic() {
      this.showMonthStatisticDialog = false
    },
    onUpdate(e) {
      console.log('拖拽结束：', e)
    },
    onAdd(e) {
      console.log('添加结束：', e)
    },
    remove(e) {
      console.log('移除结束：', e)
    },
    handleClassMoreClick(e) {
      e.stopPropagation()
    },
    classSlideChange() {
      document.querySelectorAll('.class-drag-container').forEach(el => {
        new Sortable(el, {
          group: {name: 'classDrag', put: false, pull: 'clone'},
          animation: 150,
          dataIdAttr: 'data-id',
          onEnd: (e) => {
            console.log('课程id:' + e.item.dataset.id)
            console.log('日期:' + e.to.dataset.date)
            if (e.item.dataset.id && e.to.dataset.date) {
              const classItem = this.findClassById(e.item.dataset.id)
              const params = {classesId: classItem.id, classesJson: JSON.stringify(classItem.classesJson), classesDate: e.to.dataset.date, sportType: classItem.sportType}
              this.AddScheduleClass(params)
            }
          }
        });
      });
    },
    handleAddClass() {
      this.showAddClassTitle = true
    },
    onSaveClassTitle(payload) {
      this.classModalData = {...payload}
      this.showAddClassTitle = false
      this.showSportTypeModal = true
    },
    onSelectSportType(item) {
      switch (item.key) {
        case 'swim':
          this.showAddSwimClass = true
          break
        case 'strength':
          this.showAddPowerClass = true
          break
        case 'note':
          this.showAddNoteClass = true
          break
        case 'other':
          this.showAddOtherClass = true
          break
        case 'rest':
          this.showAddRestClass = true
          break
        case 'ride':
          this.showAddBikeClass = true
          break
        case 'run':
          this.showAddRunClass = true
      }

      this.showSportTypeModal = false
    },
    onSaveAddSwimClass(payload) {
      console.log('保存泳课：', payload)
      this.getClassList()
    },
    onSaveAddBikeClass(payload) {
      console.log('保存骑行课：', payload)
      this.getClassList()
    },
    onSaveAddRunClass(payload) {
      console.log('保存跑步课：', payload)
      this.getClassList()
    },
    onSaveAddPowerClass(payload) {
      console.log('保存力量课：', payload)
      this.getClassList()
    },
    onSaveAddNoteClass(payload) {
      console.log('保存笔记课：', payload)
      this.getClassList()
    },
    onSaveAddOtherClass(payload) {
      console.log('保存其他课：', payload)
      this.getClassList()
    },
    onSaveAddRestClass(payload) {
      console.log('保存休息课：', payload)
      this.getClassList()
    },
    handleClassDetail(id, sportType) {
      console.log(sportType)
      this.classModalData.id = id
      switch (sportType) {
        case 'SWIM':
          this.showAddSwimClass = true
          break
        case 'CYCLE':
          this.showAddBikeClass = true
          break
        case 'RUN':
          this.showAddRunClass = true
          break
        case 'STRENGTH':
          this.showAddPowerClass = true
          break
        case 'OTHER':
          this.showAddOtherClass = true
          break
        case 'REMARK':
          this.showAddNoteClass = true
          break
        case 'REST':
          this.showAddRestClass = true
          break
      }
    },
    onSaveAddGroup() {
      this.showAddGroup = false
      this.getClassList()
    },
    handleAddGroup() {
      this.currentGroup = {id: '', classesGroupName: ''}
      this.showAddGroup = true
    },
    handleEditGroup(id, groupName) {
      this.currentGroup = {id, classesGroupName: groupName}
      this.showAddGroup = true
    },
    handleDeleteGroup(id) {
      this.$confirm('确认删除该分组？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        submitData({
          url: '/api/classesGroup/deleteClassesGroup?id=' + id
        }).then(res => {
          if (res.success) {
            this.getClassList()
            this.$message.success('删除成功')
          }
        })
      }).catch(() => {})
    },
    handleMoveGroup(id) {
      this.moveGroupId = id
      this.showMoveGroup = true
    },
    onSaveMoveGroup() {
      this.showMoveGroup = false
      this.moveGroupId = ''
      this.getClassList()
    },
    // 显示绑定弹框
    showBindModalDialog(exerciseData, courseData) {
      this.bindExerciseData = exerciseData
      this.bindCourseData = courseData
      this.showBindModal = true
    },
    // 绑定确认
    onBind(data) {
      console.log('绑定数据：', data)
      // 这里可以调用绑定API
      submitData({
        url: '/api/classSchedule/classBindingActivity',
        requestData: {classScheduleId: data.courseData.id, bindingActivityId: data.exerciseData.id, classesDate: data.exerciseData.dataDate}
      }).then(res => {
        if (res.success) {
          this.$message.success('绑定成功')
          this.getScheduleData()
        } else {
          this.$message.error(res.message)
          this.getScheduleData()
        }
      }).finally(() => {
        this.getScheduleData()
      })
    },
    // 取消绑定
    onCancelBind() {
      this.showBindModal = false
    },
    // 处理绑定按钮点击
    handleBind(classItem, activityItem) {
    // 模拟运动数据
      const exerciseData =
      {
        name: activityItem.activityName,
        duration: activityItem.duration,
        sth: activityItem.sthValue,
        id: activityItem.activityId,
        dataDate: activityItem.dataDate
      }

      // 模拟课程数据 - 这里可以从课程列表中选择
      const courseData = {
        name: classItem.classesJson.title,
        duration: classItem.duration,
        sth: classItem.sthValue,
        id: classItem.id,
        classesJson: classItem.classesJson
      }

      this.showBindModalDialog(exerciseData, courseData)
    },
    // 进入课表详情
    handleClassSchedulaDetail(id, sportType) {
      this.classSportType = sportType
      this.classDetailData = {id}
      this.$nextTick(() => {
        this.showClassDetailModal = true
      })
    },
    // 关闭课表详情
    handleClassDetailSave() {
      this.showClassDetailModal = false
      this.classSportType = ''
      this.classDetailData = {id: ''}
      this.getScheduleData()
    },
    // 获取icon 图片地址
    getSportImageIcon(sportType) {
      switch (sportType) {
        case 'SWIM':
          return require('@/assets/addClass/icon-swim.png');
        case 'CYCLE':
          return require('@/assets/addClass/icon-bike.png');
        case 'RUN':
          return require('@/assets/addClass/icon-run.png');
        case 'STRENGTH':
          return require('@/assets/addClass/icon-power.png');
        default:
          return require('@/assets/addClass/icon-other.png');
      }
    },
    // 获取不同运动背景颜色
    getSportBackgroundColor(percent) {
      if (percent >= 80 && percent <= 120) {
        return ['rgb(239,246,233)', 'rgb(120,203,40)'];
      }
      if (percent < 80 || percent > 120) {
        return ['rgb(255,252,238)', 'rgb(255,213,91)'];
      }
      if (percent > 0 && percent < 60) {
        return ['rgb(211,152,120)', 'rgb(234,99,49)'];
      }
      if (percent === 0) {
        return ['rgb(254,235,235)', 'rgb(245,64,62)'];
      }
      return ['rgb(255,252,238)', 'rgb(129,129,254)'];
    },
  }
}
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
    background-color: #FDE5E5;
  }

  .schedule-table-header-cell:last-child {
          border-right: none;
      }
      .schedule-table-header-cell-data {
          background-color: #fff;
          flex: 0 0 220px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          line-height: 34px;
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

              .sport-container-noDrag {
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
                      background-color: #D0D0D0;
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
                      background-color: #D0D0D0;
                  }
              }
              .green {
                  .sport-operate {
                      background-color: #83DFA1;
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
>div {
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
>div:nth-child(1) {
  padding: 4px 0 0 4px;
  border-radius: 6px 0 0 6px;
  background-color: rgba(93, 187, 246, 1);
  span:nth-child(1) {
    border-radius: 6px 0 0 6px;
  }
}
>div:nth-child(2) {
  padding: 4px 4px 6px 4px;
  border-radius: 6px;
  background-color: rgba(204, 35, 35, 1);
  span:nth-child(1) {
    border-radius: 6px;
  }
}
>div:nth-child(3) {
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
      span,div {
          flex: 1;
          font-size: 12px;
          color: #333;
          span:nth-child(2) {
              color: #999;
          }
      }
      >span {
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
  >li {
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
          background-color: #CC2323;
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
      width: 100%;
      padding: 0 10px;
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
      gap:6px;

      >span {
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
box-shadow: 0 0 1px 0 rgba(0,0,0,0.75);
.card-body {
  width: 100%;
  padding-left: 2px;
  padding-right: 2px;
  .body-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background-color: white;
    padding: 5px 3px;
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
