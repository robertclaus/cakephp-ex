function processFrame()
{
                stat.new_frame();
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
stat.start("haar detector");
                    ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
			
                    work_ctx.drawImage(video, 0, 0, work_canvas.width, work_canvas.height);
                    var imageData = work_ctx.getImageData(0, 0, work_canvas.width, work_canvas.height);

                    
                    jsfeat.imgproc.grayscale(imageData.data, work_canvas.width, work_canvas.height, img_u8);


//console.log("Pyramid");
			var minWidth = 10;// 24*2;
			var minHeight = 10; //24*2;
			var scale = 1; // 1/(48);
			var levels = 2; //4;
			var pyr = jsfeat.bbf.build_pyramid(img_u8, minWidth*scale, minHeight*scale, levels);
//console.log("Detect");
                    var rects = jsfeat.bbf.detect(pyr, jsfeat.bbf.face_cascade);
//console.log("Rect");
                    rects = jsfeat.bbf.group_rectangles(rects, 1);
//console.log("Draw");
                    draw_faces(ctx, rects, canvasWidth/img_u8.cols, canvasHeight/img_u8.rows, 1);


/*
                    // possible options
                    if(options.equalize_histogram) {
                        jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
                    }
                    //jsfeat.imgproc.gaussian_blur(img_u8, img_u8, 3);

                    jsfeat.imgproc.compute_integral_image(img_u8, ii_sum, ii_sqsum, classifier1.tilted ? ii_tilted : null);

                    if(options.use_canny) {
                        jsfeat.imgproc.canny(img_u8, edg, 10, 50);
                        jsfeat.imgproc.compute_integral_image(edg, ii_canny, null, null);
                    }

                    jsfeat.haar.edges_density = options.edges_density;
                    var rects1 = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, options.use_canny? ii_canny : null, img_u8.cols, img_u8.rows, classifier1, options.scale_factor, options.min_scale);
                    rects1 = jsfeat.haar.group_rectangles(rects1, 1);
                    var drew = draw_faces(ctx, rects1, canvasWidth/img_u8.cols, canvasHeight/img_u8.rows, 1);

			if(!drew)
			{
			var rects2 = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, options.use_canny? ii_canny : null, img_u8.cols, img_u8.rows, classifier2, options.scale_factor, options.min_scale);
                    	rects2 = jsfeat.haar.group_rectangles(rects2, 1);
			draw_faces(ctx, rects2, canvasWidth/img_u8.cols, canvasHeight/img_u8.rows, 1);
			}
*/
stat.stop("haar detector");
	

                    
                }
}



            function draw_faces(ctx, rects, scWidth, scHeight, max) {
                var on = rects.length;
                if(on && max) {
                    jsfeat.math.qsort(rects, 0, on-1, function(a,b){return (b.confidence<a.confidence);})
                }
                var n = max || on;
                n = Math.min(n, on);
                var r;
                for(var i = 0; i < n; ++i) {
			    //console.log(rects[i].confidence);
                    r = rects[i];
				if(direction>180)
				{
				ctx.strokeStyle="#FF0000";
				}
				else
				{
				ctx.strokeStyle="#1100CC";
				}
			$('#log').html(stat.log()+"<br/>Direction: "+direction + "<br/>Height: "+r.height*scHeight);

                    	ctx.strokeRect((r.x*scWidth)|0,(r.y*scHeight)|0,(r.width*scWidth)|0,(r.height*scHeight)|0);
			lastRectctx.drawImage(canvas, (r.x*scWidth)|0,(r.y*scHeight)|0,(r.width*scWidth)|0,(r.height*scHeight)|0,0,0,100,100);
                }
		if(!on)
		{
			//Default viewwindow
			ctx.strokeRect(300,200,200,200);
			lastRectctx.drawImage(canvas, 300,200,200,200,0,0,200,200);
		}
			return on;
            }