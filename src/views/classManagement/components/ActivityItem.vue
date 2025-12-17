<template>
  <div class="activity-item">
    <div class="activity-left">
      <div class="activity-icon">
        <img :src="getActivityIcon(activity.sportType)" />
        <span
          class="activity-name"
          v-if="
            (activity.classesJson && activity.classesJson.title) ||
            activity.activityName
          "
        >
          {{
            activity.classesJson
              ? activity.classesJson.title
              : activity.activityName
          }}
        </span>
        <span class="activity-name" v-else>
          {{ getSportTypeName(activity.sportType) }}_手动录入
        </span>
      </div>
      <i class="el-icon-close activity-close" @click="handleRemove"></i>
    </div>
    <div class="activity-details">
      <div class="activity-time">{{ activity.duration }}</div>
      <div class="activity-distance">
        {{ formatDistance(activity.distance, activity.sportType) }}
        <span v-if="activity.sportType === 3"> m </span>
        <span v-else>km</span>
      </div>
      <div class="activity-tss">
        {{ activity.sthValue ? activity.sthValue : "--" }}
        <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
import { getSportTypeName } from "../utils/helpers";

export default {
  name: "ActivityItem",
  props: {
    activity: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDistance(distance, sportType) {
      let result = distance;
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && typeof distance === "number" && distance > 0) {
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      if (sportType === 3 && result > 0) {
        result = distance;
      } else {
        result = Math.round(distance / 10) / 100;
      }
      console.log(result, "------------result111");
      return result;
    },
    getSportTypeName(sportType) {
      return getSportTypeName(sportType);
    },
    getActivityIcon(sportType) {
      const iconMap = {
        SWIM: require("@/assets/addClass/icon-swim.png"),
        CYCLE: require("@/assets/addClass/icon-bike.png"),
        RUN: require("@/assets/addClass/icon-run.png"),
        1: require("@/assets/addClass/icon-bike.png"),
        2: require("@/assets/addClass/icon-run.png"),
        3: require("@/assets/addClass/icon-swim.png"),
      };
      return iconMap[sportType] || require("@/assets/addClass/icon-other.png");
    },
    handleRemove() {
      this.$emit("remove", this.activity);
    },
  },
};
</script>

<style lang="scss" scoped>
.activity-item {
  background: #fff;
  border-radius: 6px;
  margin-bottom: 10px;
  position: relative;
  border: 1px solid #e8e8e8;
  gap: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  .activity-left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 50px;
    flex-shrink: 0;
    min-width: 100px;
    border-bottom: 1px solid #e8e8e8;
    margin-left: 10px;

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 30px;
        height: 30px;
        object-fit: contain;
        margin-right: 20px;
      }
    }

    .activity-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100px;
    }
    i {
      margin-right: 10px;
    }
  }

  .activity-details {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: #666;
    flex: 1;
    justify-content: space-around;
    min-height: 50px;

    .activity-time,
    .activity-distance,
    .activity-tss {
      white-space: nowrap;
      font-weight: 600;
      font-size: 14px;
    }
  }

  .activity-close {
    font-size: 16px;
    color: #d0d0d0;
    cursor: pointer;
    transition: color 0.3s;
    flex-shrink: 0;

    &:hover {
      color: #e42827;
    }
  }
}
</style>
