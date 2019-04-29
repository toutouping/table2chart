<template>
  <div class="app">
    <el-container>
      <el-container style="height: calc(100vh - 60px);">
        <el-aside width="700px">
          <el-table :data="tableList" border size="min">
            <el-table-column prop="title" label="任务">
              <template slot-scope="scope">
                <el-input v-model="scope.row.title" size="mini"></el-input>
                <!-- <el-select v-model="scope.row.title" size="mini" filterable allow-create default-first-option placeholder="请输入内容">
                  <el-option label="开发" value="开发"></el-option>
                  <el-option label="测试" value="测试"></el-option>
                </el-select> -->
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
            <span style="position:absolute; left: 0px;line-height: 38px">寬度调节</span>
            <el-slider style="margin-left: 80px" @change="nextDrawPie" v-model="chartWidth"></el-slider>
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
// import echarts from 'echarts';
import {formatDate} from 'src/common/date.js';
// "echarts": "^4.2.1",

export default {
  name: "app",
  data() {
    return {
      charts: null,
      chartWidth: 25,
      chartHeight: 25,
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
    handleInsert(row) {
      let result = [];
      let i = 0;

      this.tableList.forEach((item, index) => {
        if (item.id === row.id) {
          result.push({
            id: i++,
            title: "",
            rangeTime: []
          });
        }
        result.push({
          id: i++,
          title: item.title,
          rangeTime: item.rangeTime
        });
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
    nextDrawPie(size) {
      let main = document.getElementById("main");
      let parent = document.getElementById("chart-contain");
      parent.innerHTML = "";
      let ele = document.createElement("div");
      ele.setAttribute("id", "chart");
      ele.style.width = this.chartWidth * (main.clientWidth - 20) / 25 + "px";
      ele.style.height = this.chartHeight * (main.clientHeight - 40) / 25 + "px";
      parent.appendChild(ele);
      this.charts = echarts.init(document.getElementById("chart"));
      this.drawPie();
    },
    drawPie() {
      let barLength = 30;
      let titleList = [];
      let startTimeList = [];
      let endTimeList = [];

      this.tableList.forEach(item => {
        titleList.push(item.title);
        if (item.rangeTime && item.rangeTime.length > 0) {
          startTimeList.push(item.rangeTime[0]);
          endTimeList.push(item.rangeTime[1]);
        }
      });
      let option = {
        title: {
          text: "整体进展计划",
          left: 10
        },
        legend: {
          data: []
        },
        grid: {
          containLabel: true,
          left: 20
        },
        // 　　　dataZoom:[{
        // 　　　　type: 'slider',//图表下方的伸缩条
        // 　　　　show : true, //是否显示
        // 　　　　realtime : true, //拖动时，是否实时更新系列的视图
        // 　　　　start : 0, //伸缩条开始位置（1-100），可以随时更改
        // 　　　　end : 100, //伸缩条结束位置（1-100），可以随时更改
        // 　　　}],
        xAxis: {
          type: "time",
          key: "month",
          field: "month",
          timeFormat: "month",
          tickMax: true,
          min: "dataMin",
          max: "dataMax",
          nameLocation:'end',
          rotate: 45,
          axisLabel: {
            formatter : function(data) {
              return formatDate(new Date(data), 'MM/dd'); 
            }
          }
        },
        yAxis: [
          {
            show: false,
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
            label: {
              normal: {
                show: true,
                position: "inside",
                distance: 15,
                align: "left",
                verticalAlign: "left",
                rotate: 0,
                color: "#333",
                formatter: "{b}",
                textStyle: {
                  color: "#333"
                },
                fontSize: 16
              }
            },
            itemStyle: {
              normal: {
                color: "#F98563"
              }
            },
            markLine: {
              symbol: "none",
              label: {
                normal: {
                  fontSize:14,
                  formatter : function(data) {
                    return '今天' //  + formatDate(data.value, 'MM/dd'); 
                  }
                }
              },
              data: [
                {
                  name: 'Y 轴值为 100 的水平线',
                  xAxis: new Date(),
                  lineStyle: {
                    normal: {
                      color: "green",
                      width: 1,
                      type: "solid"
                    }
                  }
                }
              ]
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
