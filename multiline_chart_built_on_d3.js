function multiline_linechart(id, data1){
    var data = data1['data']
//----------------------------------------------------------------------
// method to clone data
//----------------------------------------------------------------------    
    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

//--------------------------------------------------------------------------
//list of the variables that will be refered often
//--------------------------------------------------------------------------
    var nameset = [] //list of the names of dataset
    var colorset = {} //associated colors
    var record = {} //holds the state of the bullets
    var temp_nameset = []//temporary nameset changed by bullets
    
    var reference_dict = {}//pouplated and updated by draw function and is used by drawbullets and 
    var reference_list = [] //list dates to be displayed in the graph (scaled to pixels)
    var    reference_list_int = [] //integer values of reference_list

//---------------------------------------------------------------------------
//populating nameset and colorset
//---------------------------------------------------------------------------
    for (k in data["setting"]) {
        nameset.push(data["setting"][k]["name"]); //get names of datasets from the graph
        colorset[data["setting"][k]["name"]] = [data["setting"][k]["color"],k]; //get colorset for each datasets
        record[data["setting"][k]["name"]] = 1; //set states of each dataset to 1 (display everything)
    }

    temp_nameset = clone(nameset) //in the beginning temp_nameset will hold names of all dataset

    var margin = {top: 10, right: 60, bottom: 100, left: 60};
    draw(300, window.innerWidth, data, nameset, colorset);
    drawbullets(300, window.innerWidth);

//redraw is called when window is resized calls all the function but initialize list
//the function updates reference_list


    function drawResize(){
        document.getElementById('graph'+id).innerHTML = "";
        draw(300, window.innerWidth, data, temp_nameset, colorset);
        drawbullets(300, window.innerWidth);
    }

    function draw(height, width, data, temp_nameset, colorset){
        var width = width - margin.left - margin.right,
            height = height - margin.top - margin.bottom;

//draw the graphholder
        var svg = d3.select(document.getElementById('graph'+id)).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id","frame"+id)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id","lineholder"+id);
    
//----------------------------------------------------------------------------
//get time scale and plot each dataset
//----------------------------------------------------------------------------
        time_concat = []
        for (k in temp_nameset){
            dataline = data[temp_nameset[k]];
            time_concat = time_concat.concat(dataline);
        }
        
        time_extent = d3.extent(time_concat,function(d){
            return d.time});
        count_extent = d3.extent(time_concat, function(d){return d.count});
        
        time_scale = []
        time_scale = d3.time.scale().domain(time_extent).range([0, width-200]);
        count_scale = []
        count_scale = d3.scale.linear().domain(count_extent).range([height, 0]);
        var yAxis = d3.svg.axis().scale(count_scale)

        var yAxis = yAxis.orient("left")
        
        svg.append("g")
        .attr("class", "yaxis")
        .attr("id","yaxis"+ k +id)
        .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y",function(){
              if (typeof count_extent[0] === 'number'){
                  value = (String(count_extent.slice(-1)[0]).length) * -3 - 23
                  return value
              };
              return -23;
          })
          .attr("x",-height/2)
          .attr("fill", 'black')
          .attr("class", "yaxislabel")
          .attr("font-size", "1.4em")
          .attr("font-family", "Verdana")              
          .style("text-anchor", "middle")
          .text(data1['graph-setting']['y-axis']);

        var xAxis = d3.svg.axis().scale(time_scale).ticks(9).orient("bottom");
//draw xaxis
        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
//getting y-axis ready
        for (k in temp_nameset){
            dataline = data[temp_nameset[k]];
//scale for lines
            var line = d3.svg.line()
            .x(function(d) { return time_scale(d.time); })
            .y(function(d) { return count_scale(d.count); });
//draw line between datapoints
            svg.append("path")
            .attr("d", line(data[temp_nameset[k]]))
            .attr("class", "line")
            .attr("id","line"+k+id)
            .attr("stroke",colorset[temp_nameset[k]][0]);
//draw the datapoints
            svg.selectAll(".dot"+id)
            .data(data[temp_nameset[k]])
              .enter().append("circle")
            .attr("class", "dots")
            .attr("id", function(d, i) {
                dict = {}
                dict[temp_nameset[k]] = i
                time = time_scale(d.time)
                if (reference_dict.hasOwnProperty(time)){
                    reference_dict[time][temp_nameset[k]] = i;
                }
                else{
                    reference_dict[time] = dict;
                }
                return "dot"+k+"o"+ i})
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("stroke", colorset[temp_nameset[k]][0])
            .attr("r", 2)};

//for display of the information
//a invisible rectriangle for calibration of tooltip
        d3.select(document.getElementById("frame"+id)).append("rect")
        .attr("width",width - 200)
        .attr("height",height)
        .attr("fill","white")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id","holder"+id)
        .attr("opacity",0); 

        crosshair = d3.select(document.getElementById('lineholder'+id)).append("g")
        .attr("id","mousepos"+id)
        .attr("opacity", 0);

        crosshair.append("rect")
        .attr("fill", "black")
        .attr("height",height)
        .attr("width",2.5)
        .attr("opacity","0.7");

        description_holder = crosshair.append("g")
        .attr("x",3)
        .attr("id","des_rect"+id)
    
        description_holder.append("rect")
        .attr("fill", "white")
        .attr("stroke","black")
        .attr("stroke-width",2)
        .attr("height",80)
        .attr("width",185)
        .attr("rx",5)
        .attr("ry",5)
        .attr("y", 4)
        .attr("opacity","0.6");

        description_holder.append("text")
        .attr("opacity","1")
        .attr("font-size", "1.3em")
          .attr("font-family", "Verdana")
          .attr("id","des_text"+id)
        
          reference_list = Object.keys(reference_dict)
        for (number in reference_list){
            reference_list_int.push(parseFloat(reference_list[number]))
        }
        reference_list_int.sort(function(a,b){return a - b})

          d3.select("#holder"+id)
        .on("mouseover", function() {
            d3.select(document.getElementById('mousepos'+id))
            .attr("opacity",1)})
        .on("mouseout", function() {
            d3.select(document.getElementById('mousepos'+id))
            .attr("opacity",0)})
        .on("mousemove", function() 
        {
            var mouse_pos = d3.select(document.getElementById('mousepos'+id))
            var rect_pos = d3.select(document.getElementById('des_rect'+id))
            
            mouse_x = d3.mouse(document.getElementById('holder'+id))[0]
            mouse_y = d3.mouse(document.getElementById('holder'+id))[1]
            
            if (!(reference_dict.hasOwnProperty(mouse_x))) {
                i = 0
                while (mouse_x > reference_list_int[i]){
                    i++
                    }
                if ( mouse_x - (reference_list_int[i]+reference_list_int[i-1])/2 > 0){
                    mouse_x = reference_list_int[i]
                }
                else{
                    mouse_x = reference_list_int[i-1]
                }}
            mouse_pos.attr("transform", "translate(" + (mouse_x) + "," + 0 + ")");
            rect_pos.attr("transform", "translate(" + 3 + "," + (mouse_y * 0.5) + ")");
            
            infolist = []
            
            for (entry in reference_dict[mouse_x]){
                infolist.push([reference_dict[mouse_x][entry],entry])
            }
            d3.select(document.getElementById('des_text'+id)).text(function(){
                if(infolist[0]){ 
                var time = new Date(data[infolist[0][1]][infolist[0][0]]["time"])
                var curr_date = time.getDate();
                var curr_month = time.getMonth() + 1; //Months are zero based
                var curr_year = time.getFullYear();
                date = (curr_year + "-" + curr_month + "-" + curr_date);
                return date;}
            }
            )
        d3.select("#des_text"+id).selectAll(".weird"+id)
        .data(infolist)
        .enter()
        .append("tspan")
        .text(function(d){
            return d[1] + " : " + (data[d[1]][d[0]]["count"]).toFixed(2)})
        .attr("x","5").attr("y",function(d,i){ return i*20+20})            
        .attr('fill',function(d,i){return colorset[d[1]][0]})
        })                
        }

    function drawbullets(height, width){
        svg = d3.select(document.getElementById('frame'+id))
        svg.append("g")
          .attr("id","bulletholder"+id)
          .attr("height", 10);

        bulletholder = d3.select("#bulletholder"+id);

        var dist = function(){

        }

        bulletholder.selectAll(".bullets"+id)
          .data(nameset)
          .enter()
          .append("g")
        .attr('class','bullets'+id)
        .attr('id',function(d,i){return "bullet"+i+id})
        .attr("transform", function(d, i) {  
            var length = 0
              $.each(nameset.slice(0,i),function(index, value){
                  length += value.length * 8.2; 
              })
            return  "translate(" + length + ", 0)" })
        .append("circle")
        .attr('cx', 0)
        .attr('r', 4.5)
        .attr('id',function(d,i){return "circle"+i})
        .attr('tag',function(d,i){return nameset[i]})
        .attr('stroke',function(d,i){return colorset[nameset[i]][0]})
        .attr('fill',function(d,i){if (record[nameset[i]] == 1){return colorset[nameset[i]][0]} else {return "white"}})
        .attr('stroke-width',2)
        .on("click", selectData);
   
        bulletholder.selectAll(".bullets"+id)
        .data(nameset)
        .append("text")
        .attr("x",10)
        .attr("y",2.7)  
        .attr("font-size", "0.5em")
        .attr("fill","black")
        //.attr('fill',function(d,i){return colorset[i]})
        .text(function(d) { 
            return d;});
        
        var width_of_g = $('#bulletholder'+id)[0].getBBox().width
        
        bulletholder.attr("transform", "translate(" + (margin.left/2 + width/2 -100 -margin.right/2 - width_of_g/2) + ", "+ (height - 60) +")");
    }

    function selectData(){    
        dataset = this.getAttribute('tag')
        prev_state = record[dataset];
        if (prev_state == 0){
            this.setAttribute('fill',colorset[dataset][0]);
            record[dataset] = 1;
        }
        else{
            this.setAttribute('fill','white');
            record[dataset] = 0;
        }
        var someset = []
        for (k in nameset){
            someset[k] = record[nameset[k]]
        }
        temp_nameset = []
        for (k in someset){
            if (someset[k] == 1){
                temp_nameset.push(nameset[k])
            }
            reference_dict = {}
        }
        drawResize();
    }
}