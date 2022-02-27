# FundSpider

前端代码重构上传在了`fund-view`

#### 项目体验地址: [fund.huabyte.com](https://fund.huabyte.com)

部分界面截图：

![1](https://assets.huabyte.com/blog/image/fund3.png)

![2](https://assets.huabyte.com/blog/image/fun2.png)

![2](https://assets.huabyte.com/blog/image/fund1.png)



## 接口说明

### 无需登录

> ### 爬取所有基金代码

接口地址：/fetchFundCodes

> ### 爬取基金详情信息

接口地址：/fetchFundInfo/:code

```
{
    fundCode: "000001",
    fundName: "华夏成长证券投资基金",
    fundNameShort: "华夏成长混合",
    fundType: "混合型-偏股",
    releaseDate: "2001年11月28日",
    buildDate: "2001年12月18日 / 32.368亿份",
    assetScale: "44.29亿元（截止至：2021年06月30日）",
    shareScale: "30.5556亿份（截止至：2021年06月30日）",
    administrator: "华夏基金",
    custodian: "建设银行",
    manager: "阳琨、王泽实、刘文成",
    bonus: "每份累计2.51元（22次）",
    managementRate: "1.50%（每年）",
    trusteeshipRate: "0.25%（每年）",
    saleServiceRate: "---（每年）",
    subscriptionRate: "1.00%（前端）"
}
```

> ### 爬取基金阶段涨幅

接口地址：/Fundstage/:code

```
{
    fundName: "华夏成长混合",
    assetScale: "44.29亿元（2021-06-30）",
    stageAmout: {
        近1周: 0.24,
        近1月: -0.24,
        近3月: -10.43,
        近6月: -4.39,
        今年来: -7.06,
        近1年: -8.21,
        近2年: 23.96,
        近3年: 50.47
    },
    averageAmout: {
        近1周: 1.4,
        近1月: -0.95,
        近3月: -2.62,
        近6月: 9.27,
        今年来: 5.76,
        近1年: 16.32,
        近2年: 77.84,
        近3年: 137.5
    },
    csiAmout: {
        近1周: 0.8,
        近1月: 1.38,
        近3月: -3.73,
        近6月: -3.23,
        今年来: -5.54,
        近1年: 3.52,
        近2年: 27.22,
        近3年: 57.03
    }
}
```

> ### 爬取基金阶段日涨跌情况

接口地址：/fetchFundData/:code/:stage

`stage`取值：oneweek | onemonth | threemonth | sixmonth | oneyear | threeyear

```
[
    {
        date: "2021-10-19",
        unitNet: "1.2630",
        accumulatedNet: "3.7740",
        changePercent: "1.53%"
    },
    {
        date: "2021-10-18",
        unitNet: "1.2440",
        accumulatedNet: "3.7550",
        changePercent: "-1.74%"
    },
    {
        date: "2021-10-15",
        unitNet: "1.2660",
        accumulatedNet: "3.7770",
        changePercent: "-0.24%"
    },
    {
        date: "2021-10-14",
        unitNet: "1.2690",
        accumulatedNet: "3.7800",
        changePercent: "-1.25%"
    },
    {
        date: "2021-10-13",
        unitNet: "1.2850",
        accumulatedNet: "3.7960",
        changePercent: "1.98%"
    },
    {
        date: "2021-10-12",
        unitNet: "1.2600",
        accumulatedNet: "3.7710",
        changePercent: "-0.47%"
    }
]
```

### 需登录(一下自己根据项目代码了解)

> ### 注册接口

> ### 登入接口

> ### 退出登录

> ### 发送目标基金

> ### 发送自选基金信息

> ### 返回规则

> ### 接收规则

> ### 接收自选基金

> ### 移除自选基金

> ### 订阅邮箱报表

> ### 获取是否订阅

> ### 取消订阅