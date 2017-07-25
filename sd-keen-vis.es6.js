(function() {
  Polymer({

    is: 'sd-keen-vis',

    properties: {
        /**
        * This property keeps track of the number of clicks.
        *
        * @property counterValue
        */
        counterValue: {
            type: Number,
            value: 0,
            notify: true
        },
        project: {
            type: String
        },
        readKey: {
            type: String
        },
        collection: {
            type: String
        },
        targetProperty: {
            type: String
        },
        groupBy: {
            type: Array,
            value: function() {
                return []
            }
        },
        filters: {
            type: Array,
            value: function() {
                return []
            }
        },
        analysisType: {
            type: String
        },
        timeframe: {
            type: String
        },
        interval: {
            type: String
        },
        yTitle: {
            type: String
        },
        // TODO get rid of this.
        axisExtents: {
            type: Object,
            notify: true,
            value: function() {
                return {"x":["dynamic","dynamic"],"y":["dynamic","dynamic"]};
            }
        },
        // Anything prefixed with chart = output.
        chartYAxisConfig: {
            type: Object,
            notify: true,
            readOnly: true,
            value: function() {
                return {}
            }
        },
        chartExtents: {
            type: Object,
            notify: true,
            readOnly: true,
            value: function() {
                return {"x":["dynamic","dynamic"],"y":["dynamic","dynamic"]};
            }
        },
        chartSeriesConfig: {
            type: Object,
            notify: true,
            readOnly: true,
            value: function() {
                return {};
            }
        },
        chartData: {
            type: Object,
            notify: true,
            reflectToAttribute: true,
            value: function() {
                return {}
            },
            readOnly: true
        }
    },
    observers: [
        '_initClient(project, key)',
        '_updateQuery(collection, analysisType)'
    ],
    created: function() {
    },
    attached: function() {
       this._configureChartDefaults();
       this._updateQuery();
    },
    _initClient: function() {
        console.log('initClient');
        this.client = new Keen({
            projectId: this.project,
            readKey: this.readKey
        });
       this._updateQuery();
    },
    _configureChartDefaults: function() {
        this._setChartYAxisConfig({
            "title": this.yTitle || this.analysisType,
            "titleTruncation": false
        });
        this._setChartExtents(this.axisExtents)
        // TODO -- look at series config for ymax / ymin

    },

    _updateQuery: function() {
        if (!this.client) {
            this._initClient()
        }
        else {
            Keen.ready(function() {
                this.query = new Keen.Query(this.analysisType, {
                    event_collection: this.collection,
                    timeframe: this.timeframe,
                    targetProperty: this.targetProperty,
                    interval: this.interval,
                    groupBy: this.groupBy,
                    filters: this.filters
                });
                console.log(this.query);
                this._runQuery();
            }.bind(this));
        }
    },
    _runQuery: function() {
        if (this.client) {
            this.client.run(this.query, function(err, res){
                if (err) {
                    // there was an error!
                    console.log(err);
                }
                else {
                    console.log(res);
                    var result = this._processResult(res.result)
                    this._setChartData(result);
                    this._buildSeriesConfig();
               }
            }.bind(this));
        }
    },
    _buildResultRanges: function(result) {
        // TODO -- non grouped charts
        var combined = {};
        var metrics = {};
        _.forEach(result, function(ts_group) {
            _.forEach(ts_group, function(value, key) {
                if (!combined[key]) {
                    combined[key] = []
                    combined[key].push(value)
                }
                else {
                    combined[key].push(value)
                }
            })
        });
        metrics['grouped'] = _.reduce(combined, function(result, value, key) {
            result[key] = {
                'max': _.max(value),
                'min': _.min(value),
                'mean': _.mean(value)
            }
            if (result[key]['max'] == 0)
                console.log(key);
            return result;
        }, {})

        return metrics;

    },
    _processResult: function(result) {
        result = _.map(result, function(n) {
            // Intervals will automatically set x to timeseries.
            var x = ''
            if (this.interval)
                var x = parseInt(moment(n.timeframe.end).format('x'))

            // Check for grouping as value with groups comes back as array.
            if (_.isArray(n.value)) {
                var preval = _.map(n.value, function(v) {
                    var keys = _.pull(_.keys(v), 'result')
                    var y_str = _.reduce(keys, function(y_str, k) {
                        var str = (y_str + v[k]).replace(/\.|\//g, '')
                        console.log(str)
                        return str
                    }, '')
                    v['y_str'] = y_str;
                    return v;
                });
                var chartData = _.reduce(preval, function(result, value, key) {
                    result[value.y_str] = value.result;
                    return result;
                }, {});
                chartData['x'] = x
                return chartData;
            }
            else
                return {'x': x, 'y': n.value}

        }.bind(this));

        return result;
    },
    _buildSeriesConfig: function() {
        console.log(this._buildResultRanges(this.chartData));
        console.log(this.chartData);
        const seriesConfig = _.reduce(this.chartData[0], function(result, value, key) {
            result[key] = {
                "name": key,
                "x": "x",
                "y": key
            };
            return result;
        }, {});

        console.log(seriesConfig);
        this._setChartSeriesConfig(seriesConfig);

    },


    /**
    * Handles click on the element defined in 'on-click' on the template.
    *
    * @method handleClick
    */
    handleClick: function(event, detail, sender) {
      this.increment();
    },

    /**
    * Increments the counter
    *
    * @method increment
    */
    increment: function() {
      this.counterValue++;
    }
  });
})();
