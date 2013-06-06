function readText(filePath) {
	var reader; 
	reader = new FileReader();

	var output = ""; 
        if(filePath.files && filePath.files[0]) {           
            reader.onload = function (e) {
                output = e.target.result;
				document.write(output);
                //parseSpectra(output);
            };
            reader.readAsText(filePath.files[0]);
        }
        return output;
    }   

//place contents of text file into 2d array
parseSpectra = function (txt) {
	var txt_lines = txt.split('\n');
	var number_of_lines = txt_lines.length;		


	//Initatilising arrays
	//First column is field values
	//Second column is absorption values
	//Third colum is going to be the first derivative of col 2 wrt col 1

	var eprData= [[0,0],[0,0],[0,0]];	//final data array containing col1 and col3
	var firstCol = [],
	 secondCol = [],
	 thirdCol = [],
	 tempData = [];	//temp array used to create 2d array

	 
	
	
	var str = "";
	for (var i=0;i<number_of_lines-2;i++) {
	//Lines are parsed into columns by specific formatting of my data
	//Probably a more robust, more general way of doing this
	firstCol[i] = parseFloat(txt_lines[i].substring(0,25));
	secondCol[i] = parseFloat(txt_lines[i].substring(27,44));
	
	if (i >= 1) {

	//Calcualtes derivative
	thirdCol[i] = ((secondCol[i] - secondCol[i-1]) / (firstCol[i] - firstCol[i-1]));
	
	
	tempData[0] = firstCol[i];
	tempData[1] = thirdCol[i];
	eprData[i] = tempData;	//push temp array into final data array

	}
	else {
	
	thirdCol[i] = 0;
	tempData[0] = firstCol[i];
	tempData[1] = thirdCol[i];
	eprData[i] = tempData;	//push temp array into final data array
	}
	tempData = [];	//clear temp array
	


	}

	d3Plot(eprData);	//send final 2d array to be plotted

	}   

d3Plot = function (eprData)	{  
	var data = eprData;
    if($('.chart')[0]){
    d3.select("svg").remove();
    }
	//set margins for plot
    var margin = {top:20, right: 15, bottom:60, left:60},
    	width = 960 - margin.left- margin.right,
    	height = 500 - margin.top - margin.bottom;

    //set auto scale x based on data range
    var x = d3.scale.linear()
    			.domain([d3.min(data,function(d){return d[0];}),d3.max(data,function(d){return d[0];})])
    			.range([0, width]);
    //set auto scale y based on data range
    var y = d3.scale.linear()
    			.domain([d3.min(data,function(d){return d[1];}), d3.max(data,function(d){return d[1];})])
    			.range([height, 0]);
    //init chart svg
    var chart = d3.select('#wrapper')
    			.append('svg:svg')
    			.attr('widht', width + margin.right + margin.left)
    			.attr('height',height + margin.top + margin.bottom)
    			.attr('class','chart span10');
    //init main
    var main = chart.append('g')
    			.attr('transform','translate('+ margin.left + ',' + margin.top + ')')
    			.attr('width',width)
    			.attr('height',height)
    			.attr('class','main');

    //fn to draw line graph from data
    var line = d3.svg.line()
    			.x(function(d,i){
    				return x(d[0]);
    			})
    			.y(function(d){
    				return y(d[1]);
    			})
    //define x axis
    var xAxis = d3.svg.axis()
    			.scale(x)
    			.orient('bottom');
    //append x axis
    	main.append('g')
    		.attr('transform','translate(0,'+ height + ')')
    		.attr('class','main axis date')
    		.call(xAxis);
   	//define y axis
    var yAxis = d3.svg.axis()
    				.scale(y)
    				.orient('left');
    	//append y axis			
    	main.append('g')
    		.attr('transform','translate(0,0)')
    		.attr('class','main axis date')
    		.attr(yAxis);
    //add data to the graph
    var g = main.append("svg:g");

    	g.append("svg:path")
    		.data(data)
    		.attr("class","line")
    		.attr("stroke","steelblue")
    		.attr("fill","none")
    		.attr("stroke-width",3)
    		.attr("d",line(data));
    		
    	
   // add dots on data points
    	 g.selectAll("scatter-dots")
    	 	.data(data)
    	 	.enter().append("svg:circle")
    	 	.attr("cy",function(d){return y(d[1]);})
    	 	.attr("cx", function(d,i){return x(d[0]);})
    	 	.attr("r", 1)
    	 	.style("opacity", 1);

  }
function getOutput(fileName){
    $.get("server/get_output.php",{fileName:fileName},function(data){
                        
                        parseSpectra(data);
                        
                        
                        
                    });
}

//add file to mongodb
function addFiles(file){
    var data = new FormData($('form')[0]);
   
    $.ajax({
        url: 'server/upload_file.php',
        type: 'POST',
        data: formdata,
        cache: false,
        contentType: false,
        processData: false,
        success:function(data){
            if(data){
                $('#fileupload').append('file is already in database');
            }
            else{
               // getFileNames();
            }
        }
    })
}

//get file names from db
function getFileNames(){

    $.get("server/getFileNames.php",function(data){
        //console.log(data.length);
        if(data){
            $('#filelist').empty();
            for(var i=0;i<data.length;i++){
                
                $('#fileList').append('<ul><a href="#" onClick="getOutput(\''+data[i]+'\');">'+data[i]+'</a></ul>');
            }
        }    
        else{
            
            $('#fileList').append('<ul>no files in database</ul>');
        }
        
    },"json")
}