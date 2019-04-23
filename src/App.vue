<template>
  <div class="app">
    <el-container>
      <el-header>
        甘特图生成
        <!-- <el-button type="primary" size="small" @click="drawPie">甘特图生成</el-button> -->
      </el-header>
      <el-container style="height: calc(100vh - 60px);">
        <el-aside width="700px">
          <el-table :data="tableList" border size="min">
            <el-table-column prop="title" label="任务">
              <template slot-scope="scope">
                <el-select v-model="scope.row.title" size="mini" filterable allow-create default-first-option placeholder="请输入内容">
                  <el-option label="开发" value="开发"></el-option>
                  <el-option label="测试" value="测试"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="rangeTime" label="开始-结束日期" width="380">
              <template slot-scope="scope">  
                <el-date-picker
                  v-model="scope.row.rangeTime"
                  type="daterange" size="mini"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="['00:00:00', '23:59:59']">
                </el-date-picker>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
              <template slot-scope="scope">
                <el-button type="text" size="mini" @click="handleInsert(scope.row)" >插入</el-button>
                <el-button type="text" size="mini" @click="handleRemove(scope.row)" >移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" @click="handleAdd">新增</el-button>
          <div style="position: relative; margin-bottom: 10px; padding: 0 10px">
            <span style="position:absolute; left: 0px;line-height: 38px">高度调节</span>
            <el-slider style="margin-left: 80px" @change="nextDrawPie" v-model="chartHeight"></el-slider>
          </div>
        </el-aside>
        <el-main id="main">
          <div id="chart-contain"></div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      charts: null,
      chartHeight: 100,
      tableList: []
    };
  },
  mounted() {
    this.$nextTick(function() {
      this.nextDrawPie();
    });
  },
  watch: {
    tableList: {
      handler: function(newVal, oldVal) {
        this.drawPie();
      },
      deep: true
    }
  },
  methods: {
    handleInsert (row) {
      let result = [];
      let i = 0;

      this.tableList.forEach((item, index)=> {
        result.push({
          id: i++,
          title: item.title,
          rangeTime: item.rangeTime
        })
        if (item.id === row.id) {
          result.push({
            id: i++,
            title: "",
            rangeTime: []
          })
        }
      });
      this.tableList = result;
    },
    handleRemove(row) {
      this._removeAaary(this.tableList, row);
      this.nextDrawPie();
    },
    handleAdd() {
      this.tableList.push({
        id: this.tableList.length,
        title: "",
        rangeTime: []
      });
      this.nextDrawPie();
    },
    _removeAaary(_arr, _obj) {
      var length = _arr.length;
      for (var i = 0; i < length; i++) {
        if (_arr[i] == _obj) {
          if (i == 0) {
            _arr.shift(); //删除并返回数组的第一个元素
            return _arr;
          } else if (i == length - 1) {
            _arr.pop(); //删除并返回数组的最后一个元素
            return _arr;
          } else {
            _arr.splice(i, 1); //删除下标为i的元素
            return _arr;
          }
        }
      }
    },
    nextDrawPie (size) {
      let main = document.getElementById("main");
      let parent = document.getElementById("chart-contain");
      parent.innerHTML = '';
      let ele = document.createElement("div");
      ele.setAttribute("id", 'chart'); 
      ele.style.width = this.chartHeight * (main.clientWidth - 20) / 100 + "px";
      ele.style.height = this.chartHeight * (main.clientHeight - 40) / 100 + "px";
      parent.appendChild(ele); 
      this.charts = echarts.init(document.getElementById('chart'));
      this.drawPie();
    },
    drawPie() {
      let barLength = 15;
      let titleList = [];
      let startTimeList = [];
      let endTimeList = [];

      this.tableList.forEach(item => {
        titleList.push(item.title);
        if (item.rangeTime && item.rangeTime.length > 0 ) {
          startTimeList.push(item.rangeTime[0]);
          endTimeList.push(item.rangeTime[1]);
        }
      });
      let option = {
        title: {
          text: "项目进度表",
          left: 10
        },
        legend: {
          data: []
        },
        grid: {
          containLabel: true,
          left: 20
        },
        xAxis: {
          type: "time"
        },
        yAxis: [
          {
            data: titleList
          }
        ],
        toolbox: {
          feature: {
            saveAsImage: {
              pixelRatio: 2
            }
          }
        },
        tooltip: {
          trigger: "axis",
          formatter: function(params) {
            var res = params[0].name + "</br>";
            var date0 = params[0].data;
            var date1 = params[1].data;
            if (!date0 || !date0.getFullYear || !date1 || !date1.getFullYear) {
              return false;
            }
            date0 =
              date0.getFullYear() +
              "/" +
              (date0.getMonth() + 1) +
              "/" +
              date0.getDate();
            date1 =
              date1.getFullYear() +
              "/" +
              (date1.getMonth() + 1) +
              "/" +
              date1.getDate();
            res +=
              params[0].seriesName +
              "~" +
              params[1].seriesName +
              ":</br>" +
              date0 +
              "~" +
              date1 +
              "</br>";
            return res;
          }
        },
        series: [
          {
            name: "开始时间",
            type: "bar",
            barWidth: barLength,
            stack: "test1",
            itemStyle: {
              normal: {
                color: "rgba(0,0,0,0)"
              }
            },
            data: startTimeList
          },
          {
            name: "完成时间",
            type: "bar",
            barWidth: barLength,
            stack: "test1",
            itemStyle: {
              normal: {
                color: "#F98563"
              }
            },
            data: endTimeList
          }
        ]
      };
      this.charts.setOption(option);
    }
  }
};
</script>

<style lang="stylus" scoped>
.app {
  width: 100%;
  height: 100%;

  .el-table {
    margin-bottom: 10px;
  }

  .el-header {
    color: #333;
    text-align: center;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
    text-align: right;
    padding: 0 10px 20px 10px;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
  }
}
</style>
