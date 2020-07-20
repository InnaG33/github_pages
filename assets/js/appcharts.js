var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(Data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
      d3.max(Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(Data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(Data, d => d[chosenYAxis])+5])
  .range([height, 0]);

  return yLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}


function renderCirclesText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]-0.01*(d[chosenXAxis])))
    .attr("dy", d => newYScale(d[chosenYAxis]-0.02*(d[chosenYAxis])));

  return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelx;
  var labely;

  if (chosenXAxis === "poverty") {
    labelx = "Poverty:";
  }
  if (chosenXAxis === "age") {
    labelx = "Age:";
  }
  if (chosenXAxis === "income") {
    labelx = "Income:";
  }
  if (chosenYAxis === "healthcare") {
    labely = "Healthcare:";
  }
  if (chosenYAxis === "obesity") {
    labely = "Obesity:";
  }
  if (chosenYAxis === "smokes") {
    labely = "Smokes:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelx} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the app.py and execute everything below

d3.json("/read_bikes", function(Data, err){
  if (err) throw err;
// d3.csv("assets/data/data.csv").then(function(censusData, err) {
//   if (err) throw err;

  // parse data
  Data.forEach(function(data) {
    data.Age = +data.Age;
  });



  console.log(Data);

  // xLinearScale function above csv import
  var xLinearScale = xScale(Data, chosenXAxis);
  var yLinearScale = yScale(Data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 18)
    .attr("fill", "blue")
    .attr("opacity", "0.75");

  var textGroup = chartGroup.selectAll("text.testing")
    .data(censusData)
    .enter()
    .append("text")
    .attr("class", "testing")
    .attr("dx", d => xLinearScale(d[chosenXAxis]-0.01*(d[chosenXAxis])))
    .attr("dy", d => yLinearScale(d[chosenYAxis]-0.02*(d[chosenYAxis])))
    .text(function(d){
      // console.log(d.abbr);
      return d.abbr
    });

  // Create group for three x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var labelsGroupY = chartGroup.append("g");

  var healthLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x",  0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var obesityLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -70)
    .attr("x", 0 - (height / 2)-20)
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity");

  var smokesLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -95)
    .attr("x", 0 - (height / 2)-20)
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis);

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);
        yLinearScale = yScale(censusData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);
        yAxis = renderAxesY(yLinearScale, yAxis);
        
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        textGroup = renderCirclesText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        if (chosenXAxis === "income") {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }  
    });
// y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  
  if (value !== chosenYAxis) {

    // replaces chosenXAxis with value
    chosenYAxis = value;

    console.log(chosenYAxis);

    // functions here found above csv import
    // updates x scale for new data
    xLinearScale = xScale(censusData, chosenXAxis);
    yLinearScale = yScale(censusData, chosenYAxis);

    // updates x axis with transition
    xAxis = renderAxesX(xLinearScale, xAxis);
    yAxis = renderAxesY(yLinearScale, yAxis);
    
    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    textGroup = renderCirclesText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenYAxis === "healthcare") {
      healthLabel
        .classed("active", true)
        .classed("inactive", false);
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    if (chosenYAxis === "obesity") {
      obesityLabel
        .classed("active", true)
        .classed("inactive", false);
      healthLabel
        .classed("active", false)
        .classed("inactive", true);
      smokesLabel
        .classed("active", false)
        .classed("inactive", true);
    }
    if (chosenYAxis === "smokes") {
      smokesLabel
        .classed("active", true)
        .classed("inactive", false);
      healthLabel
        .classed("active", false)
        .classed("inactive", true);
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
    }
  }  
});    
}).catch(function(error) {
  console.log(error);
});


