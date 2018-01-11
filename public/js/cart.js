$(document).ready(function(){


	$('.paytype .paytype1').each( function(i){
		document.addEventListener('body', function(e) {
			e.preventDefault();
			e.stopPropagation();
		}, false);
		$(this).one().click( function(){
			//console.log(2)
			$(this).addClass('active').siblings().removeClass('active');

            $("#pro_id_input").val($(this).find("input[type=hidden]").eq(0).val());
            $("#amount_input").val($(this).find("input[type=hidden]").eq(1).val());
            $("#size_input").val($(this).find("input[type=hidden]").eq(2).val());
            $("#score_input").val($(this).find("input[type=hidden]").eq(3).val());
            $("#per_input").val($(this).find("input[type=hidden]").eq(4).val());

            $(".pop1title").html("您将支付"+
                $(this).find("input[type=hidden]").eq(1).val()/100 +"元购买" +
                $(this).find("input[type=hidden]").eq(4).val() + "份"+
                $(this).find("input[type=hidden]").eq(2).val()/10 + "CM的纸巾？");
		})
	})

	
	//搜索地图页面
	$('.smenu').click( function(){
		if( $(".search-map").css("display") =='block' ){
			$(".search-map").css("display","none");
		}else{
			$(".search-map").css("display","block");
		}
		if( $(".search-text").css("display") =='block' ){
			$(".search-text").css("display","none");
		}else{
			$(".search-text").css("display","block");
		}
	});
	
})
