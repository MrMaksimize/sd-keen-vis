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
            type: String,
            value: 'Hello'
        },
        chartYTitle: {
            type: String,
            value: '',
            notify: true,
            readOnly: true
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
        this.chartConfig = {
            seriesConfig: {}
        };
    },
    ready: function() {
        Keen.ready(function() {
            // TODO -- maybe move this out to updateQuery
            console.log('Keen ready');
        }.bind(this));
    },
    attached: function() {
       console.log('attached');
       this._configureChart();
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
    _configureChart: function() {
        this._setChartYTitle({
            "title": this.yTitle,
            "titleTruncation": false
        });
    },
    _updateQuery: function() {
        if (!this.client) {
            this._initClient()
        }
        else {
            this.query = new Keen.Query(this.analysisType, {
                event_collection: this.collection,
                timeframe: this.timeframe,
                targetProperty: this.targetProperty,
                interval: this.interval,
                groupBy: this.group,
                //filters: this.filters
            });
            console.log(this.query);
            this._runQuery();
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
                    console.log(res.result);
                    var result = res.result;
                    result = _.map(result, function(n) {
                        n = {
                            'x': parseInt(moment(n.timeframe.end).format('x')),
                            'y': n.value
                        }
                        return n;
                    })
                    this._setChartData(result);
                }
            }.bind(this));
        }
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
