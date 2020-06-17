
function optionChanged (value) {
    Charts(value);
    buildTable(value);
}

function Charts (id) {
    d3.json("samples.json").then((importedData) => {
        var filteredData = importedData.samples.filter(item => item.id === id);
       
        var sampleValues = filteredData[0].sample_values;
        var otuIds = filteredData[0].otu_ids;
        var otuLabels = filteredData[0].otu_labels;
        // console.log(`otuIds: ${otuIds}`);
        // console.log(`Labels: ${otuLabels}`);
        // console.log(`Values are: ${sampleValues}`);

        var otuIDsText = [];

        for ( var i = 0 ; i < otuIds.length ; i++ ) {
            var result = 'OTU ' + `${otuIds[i]}`
            otuIDsText.push(result);
            };
        var trace1 = {
            x : sampleValues,
            y : otuIDsText,
            type: 'bar',
            marker: {
                color: 'rgba(50,171,96,0.6)',
                line: {
                color: 'rgba(50,171,96,1.0)',
                width: 1
                }
            },
            orientation : "h",
            text: otuLabels
        };

        var layout1 = {
            xaxis: {
              range: [0, 180],
            //   domain: [0, 10],
              zeroline: false,
              showline: false,
              showticklabels: true,
              showgrid: true
            },
            margin: {
              l: 100,
              r: 20,
              t: 50,
              b: 50
            },
            width: 600,
            height: 600,
            paper_bgcolor: 'rgb(250,250,240)',
            plot_bgcolor: 'rgb(248,248,255)',
          };
    
        var data1 = [trace1];

        var markerSizes = [];

        for ( var i = 0 ; i < sampleValues.length ; i++ ) {
            markerSizes.push(sampleValues[i]*30);
            };

        var trace2 = {
            x: otuIds,
            y: sampleValues,
            text: otuLabels,
            mode: 'markers',
            marker: {
              size: markerSizes,
              sizemode: 'area',
              color: otuIds
            }
          };
          var layout2 = {
            xaxis: {
              showgrid: true,
              title : 'OTU IDs'
            },
            margin: {
              l: 100,
              r: 50,
              t: 50,
              b: 80
            },
            width: 1000,
            height: 500,
            paper_bgcolor: 'rgb(250,250,240)',
            plot_bgcolor: 'rgb(248,248,295)',
          };
          
        Plotly.newPlot("bar", data1, layout1);

        var data2 = [trace2];

        Plotly.newPlot("bubble", data2, layout2);
    });
}

function buildPlot() {

    d3.json("samples.json").then((importedData) => {
        
        var names = importedData.names
        // console.log(names);
        var selectedName = d3.select("#selDataset");
        names.forEach((name => {
            selectedName.append("option").text(name).property("value", name)
        }));

        var id = names[0];
        // console.log(id);
        Charts(id);
       
        buildTable(id);

     });
  }
  
  buildPlot();

function buildTable(id) {
    d3.json("samples.json").then((importedData) => {
    var TableData = importedData.metadata.filter(item => item.id === parseInt(id));
    // var filteredTable = TableData.filter(item => item.id === parseInt(id));

    // console.log(`filtered Table Data : ${TableData[0].age}`);
    
    var table = d3.select("#summary-list");
    var tlist = table.select("li");
    tlist.html("");
    var listitem;
    listitem = tlist.append("li").text(`ID: ${TableData[0].id}`);
    listitem = tlist.append("li").text(`Age: ${TableData[0].age}`);
    listitem = tlist.append("li").text(`Ethnicitiy: ${TableData[0].ethnicity}`);
    listitem = tlist.append("li").text(`Gender: ${TableData[0].gender}`);
    listitem = tlist.append("li").text(`Location: ${TableData[0].location}`);
    listitem = tlist.append("li").text(`BB_Type: ${TableData[0].bbtype}`);
    listitem = tlist.append("li").text(`Wfreq: ${TableData[0].wfreq}`);
  
    });
}