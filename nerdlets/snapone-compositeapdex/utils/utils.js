

// Calculates the Composite apdex for a series of data. Good for a billboard chart
export function CalculateCompositeApdex(appGroup, queryData) {
    if (queryData && appGroup && queryData.length > 0) {
        console.log("querydata", queryData)
        for (let i = 0; i < queryData.length; i++) {

            const compositeApdex = queryData.reduce(function (sum, app) {
                return sum + app.score;
            }, 0) / queryData.length;

            var metadata = {
                id: 'compositeApDex-' + appGroup, 
                name: 'Composite Apdex ' + appGroup + ' (' + queryData.length + ' applications)', 
                units_data: {y: "APDEX"},
                viz: "main",
            }

            return {appGroup: appGroup, compositeApdex: compositeApdex, metadata: metadata};
        }
    }      
}

// Calculates the Composite Apdex on a Timeseries of data
export function CalculateCompositeApdexTimeseries(appGroup, queryData) {
    if (queryData && appGroup && queryData.length > 0) {
        let compositeApdexTimeseries = []
        console.log("querydata", queryData)
        
        for (let i = 0; i < queryData.length; i++) {
            if(compositeApdexTimeseries.some(bucket => bucket.begin_time == queryData[i].beginTimeSeconds)){
                for (let k = 0; k < compositeApdexTimeseries.length; k++) {
                    if(compositeApdexTimeseries[k].begin_time == queryData[i].beginTimeSeconds){
                        compositeApdexTimeseries[k].sum += queryData[i].score;
                        compositeApdexTimeseries[k].count += queryData[i].count;
                        compositeApdexTimeseries[k].app_count += 1;
                    }
                }
            } else {
                compositeApdexTimeseries.push({sum: queryData[i].score, begin_time: queryData[i].beginTimeSeconds, end_time: queryData[i].endTimeSeconds, count: queryData[i].count, x: queryData[i].beginTimeSeconds 
                    , app_count: 1});
            }
        }

        var begin_time_range = compositeApdexTimeseries[0].begin_time;
        var end_time_range = compositeApdexTimeseries[0].end_time;

        for (let j = 0; j < compositeApdexTimeseries.length; j++) {
            compositeApdexTimeseries[j].score = compositeApdexTimeseries[j].sum / compositeApdexTimeseries[j].app_count;
            compositeApdexTimeseries[j].y = compositeApdexTimeseries[j].score;

            if(compositeApdexTimeseries[j].begin_time < begin_time_range) {
                begin_time_range = compositeApdexTimeseries[j].begin_time;
            }

            if(compositeApdexTimeseries[j].end_time > end_time_range) {
                end_time_range = compositeApdexTimeseries[j].end_time;
            }
        }

        var metadata = {
            id: 'compositeApDex-' + appGroup, 
            name: 'Composite Apdex ' + appGroup + ' (' + compositeApdexTimeseries[0].app_count + ' applications)', 
            units_data: {y: "APDEX"},
            viz: "main",
            color: "#16B3D5",
            tooltip: "{{score}} from {{begin_time}} to {{end_time}}",
            time_range: {begin_time: begin_time_range, end_time: end_time_range},
            units_data: {
                begin_time: "TIMESTAMP",
                end_time: "TIMESTAMP",
                score: "APDEX",
                x: "TIMESTAMP",
                y: "APDEX",
            },
            thresholds: [
                {min: 0, max: 0.5, color: "#848484"},
                {min: 0.5, max: 0.7, color: "#DB8D8C"},
                {min: 0.7, max: 0.85, color: "#CEC73F"},
                {min: 0.85, max: 0.94, color: "#6AD86E"},
                {min: 0.94, max: 1, color: "#00D9D9"},
            ],
        }

        return {appGroup: appGroup, compositeApdexTimeseries: compositeApdexTimeseries, metadata: metadata};
    }      
}

// Combines multiple arrays of data
export function CombineQueryDataResults(/**/) {
    var args = arguments;
    console.log("args", args)
    var queryData = []
    for(var i=0; i<args.length; i++){
        if(args[i] && args[i].length > 0){
            queryData = queryData.concat(args[i])
        }
    }

    return queryData;
}
