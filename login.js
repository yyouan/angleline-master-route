var express = require('express');
var request = require('request');
const querystring = require('querystring');
const [AngleToken,MasterToken,HallToken,InfoToken] = [
    'JeHZW0fzS1rQX9yHvGRz0ZZqC+ENFDhsf/30grCHGk80MBiNjqDz76oj+ETgTnAXPjFCp/P/1EzYYbq4Ptz6U8tLCUxBHBlLeH4iozbORQOq1zYSc2cKosq8esu3/ttrZdeRRo0wsBoWI4gjTeEjuQdB04t89/1O/w1cDnyilFU=', 
    'BOpCS2JXlx/6DfqGmLVD9vU8FmjviF0TV/QJoLfkN0C465BHYiKtyfzP1Ov4wEIcF7xFvwu64T/RrO64+cai0dY7Th5yno/goN9+dJVa4EsLoNC5JV4mYF7ROws6Og6vfHByaSO/qQRZR8sy5Bz/twdB04t89/1O/w1cDnyilFU=',  
    'chRfdlc9nHQJyi8BLGXxExjrfNoGBMfH8DPqevbDaPYsgvP1WsZ8Aqi17HRS4dpfjtSLU5QD3G6b/RjZ4GflCh4N/hIhqWhBPPUJ56dhzxAfqRtgSPYadNTsTbcV/Hm1l4YUiJHYoDqaWO2o2qY/yAdB04t89/1O/w1cDnyilFU=',
    'bE7q3TnTG/MO9rE+0sME3betLgGFgqUpYCOv0OrmW/Uefjldl9a5am6xNyC0VRcnL87qKx1GMoPzGLKQDX/PRiERLTdZ2uIf5txK+1+JhIFsSIGwI00lGGaGavvCzkyKfy5A6QrqWZdfeu0J08SJDAdB04t89/1O/w1cDnyilFU='
  ]
var CHANNEL_ACCESS_TOKEN = HallToken;
var channel_array =[];
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    //ssl: true,
});
const graph_url = [
    "https://upload.wikimedia.org/wikipedia/commons/1/19/ESA_Planck_CMB.jpg",
    "https://i.imgur.com/EdQ8tTf.jpg",
    "https://i.imgur.com/UMmVO2T.jpg",
    "https://i.imgur.com/z92G7KI.jpg",
    "https://i.imgur.com/x7MgwKt.jpg",
    "https://i.imgur.com/lOs5GOf.jpg",
    "https://i.imgur.com/NXcWALK.png",
    "https://i.imgur.com/EaQs6YU.jpg",
    "https://i.imgur.com/KiLqxHf.jpg",
    "https://i.imgur.com/lwD1F9v.jpg",
    "https://i.imgur.com/yFpbwmu.jpg",
    "https://i.imgur.com/med3yMO.jpg",
    "https://i.imgur.com/pMLQd6V.jpg",
    "https://i.imgur.com/Pe55Oc5.jpg",
    "https://i.imgur.com/I2PDbe1.jpg",
    "https://i.imgur.com/QXaebkU.jpg",
    "https://i.imgur.com/xYjIwWU.jpg",
    "https://i.imgur.com/Xx7ruza.jpg",
    "https://i.imgur.com/OcVrc0J.jpg",
    "https://i.imgur.com/DbSuGNf.png",
    "https://i.imgur.com/Dw1kRP0.png"
]

const app = express(); //建立一個express 伺服器
app.use(express.static(__dirname)); //get every file

app.post('/' , loginParser); // POST 方法**/
app.post('/form',FormReceiver);
app.get('/formhtml',FormGiver);
app.get('/imgGiver',ImgGiver);
app.post('/img',imgReceiver);
//app.get('/uploadhtml',UploadPage_giver)
app.post('')
/**
 * expected result:
 *  user:@ok     
 *  bot:googleform
 *  user:done
 * 
 */

//SQL
/**
     angle_nickname |   angle_id    | master_name     |master_group|  master_id   | department | email              | head_url |self_intro|name  |phone           |score  |ticket |Group
    ----------------+---------------+-----------------+--------------------------------------------------------------------------------------------------------------------------------------
    友安            | 0123456789012 | 另友安           |        7   | 123456789012 | phys/psy   |xu.6u.30@gmail.com  |url      |longtext  |劉友安 |0926372361  |0      |0      |  8  
    /
*/  

//login message with recpt function:
function create_member(email,line_id){
    psql("INSERT INTO ACCOUNT (email,angle_id) VALUES (\'"+email+"\',\'"+line_id+"\');");
}
function pushmessage(recpt,id){
    recpt.forEach(element => {
        console.log("pushmessage:"+element);
    });
  
    var options = {
        url: "https://api.line.me/v2/bot/message/push",
        method: 'POST',
        headers: {
          'Content-Type':  'application/json', 
          'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN
        },
        json: {
            "to": id.replace(/\s+/g, ""),
            'messages': recpt
        }
      };
      console.log(options);
      request(options, function (error, response, body) {
          if (error) throw error;
          console.log("(line)");
          console.log(body);
      });
  
}
function psql(command){
   
    return new Promise((resolve,reject)=>{
        //while(is_conn_psql){console.log("(psql):pararell gate");};
        //if(!is_conn_psql){client.connect();is_conn_psql = true;}
        let recpt =[];
        let error;
        console.log("(psql):" + command );
        pool.connect()
        .then(client=>{            
            client.query(command)
            .then(res => {
                client.release();
                for (let row of res.rows) {                
                    recpt.push(row);
                    console.log( "(psql-query):"+ JSON.stringify(row));
                }
                resolve(recpt);
                for(let row of recpt){
                    console.log( "(psql-query-recpt):"+ JSON.stringify(row));
                }
                console.log( "(psql-query-recpt):"+ recpt.length);    
            })
            .catch(e => {client.release(); console.error("(psql):" + e.stack);reject(e);});            
        });
    });
    
    
}

function loginParser(req ,res){
    //route
    var nwimg;
    const domain="https://angleline-hall.herokuapp.com";  
    //var adrr="/";
    
    // 定义了一个post变量，用于暂存请求体的信息
    var post = '';     
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    req.on('data', function(chunk){   
        post += chunk;
    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){    
        post = JSON.parse(post);
        console.log(post.events[0]);
        var replyToken = post.events[0].replyToken;
        var posttype = post.events[0].type;
        var line_id = post.events[0].source.userId;
        if( post.events[0].source.type == 'group'){
            line_id = post.events[0].source.groupId;
        } 
        /**var userMessage = post.events[0].message.text;
        console.log(replyToken);
        console.log(userMessage);**/
        if (typeof replyToken === 'undefined') {
            return;
        }

        if(posttype == 'postback'){
            let rawdata = post.events[0].postback.data;
            let data = querystring.parse(rawdata);

            if("url" in data) {
                psql("UPDATE ACCOUNT SET head_url=\'"+ data.url +"\' WHERE angle_id=\'" + line_id +"\';").then(
                    res=>{
                        let text = {
                            "type":"text",
                            "text":"已選取圖片"
                        }
                        replymessage([text]);
                    }                    
                )
            }
        }
        
        if (posttype == 'join' || posttype == 'follow'){ 
            
            let text = {
                "type":"text",
                "text":"感謝您加入遊戲，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
            }
            replymessage([text])   
        }

        if (posttype == 'message'){
            
            if(true){
                
                if(channel_array.indexOf(line_id)== -1){

                    psql("SELECT * FROM ACCOUNT WHERE angle_id=\'" + line_id +"\';")
                    .then( recpt =>{
                        if( recpt.length == 0)   
                        {
                            if(post.events[0].message.type == 'text'){
                                var email = post.events[0].message.text;
                                psql("SELECT * FROM ACCOUNT WHERE email=\'" + email +"\';").then(recpt=>{
                                    if( recpt.length == 0)
                                    {   
                                        if(post.events[0].message.text == '嗨'){

                                            let text = {
                                                "type":"text",
                                                "text":"感謝您加入遊戲(嗨不能是電子郵件)，請輸入您註冊的電子郵件地址(如：xu.6u.30@gmail.com):"
                                            }
                                            replymessage([text])

                                        }else{

                                            create_member(email,line_id);
                                            let text2 = {
                                                "type":"text",
                                                "text":"成功註冊郵箱!"
                                            }                                            

                                            let text = {
                                                "type":"text",
                                                "text":"請點選上面的按鈕，進到瀏覽器註冊，之後注意andriod手機請點選open in other app(如下圖)，iOS則不用"
                                            }
                                            let img = {
                                                "type": "image",
                                                "originalContentUrl": "https://i.imgur.com/rGsgMqc.jpg",
                                                "previewImageUrl": "https://i.imgur.com/rGsgMqc.jpg"
                                            }
                                            let login_button ={
                                                "type": "template",
                                                "altText": "大講堂有消息，請借台手機開啟",
                                                "template": {
                                                    "type": "buttons",
                                                    "thumbnailImageUrl": "https://i.imgur.com/XQgkcW5.jpg",
                                                    "imageAspectRatio": "rectangle",
                                                    "imageSize": "cover",
                                                    "imageBackgroundColor": "#FFFFFF",
                                                    "text": "按我註冊",
                                                    "defaultAction": {
                                                        "type": "uri",
                                                        "label": "註冊",
                                                        "uri": "https://angleline-hall.herokuapp.com/formhtml"
                                                    },
                                                    "actions": [
                                                        {
                                                          "type": "uri",
                                                          "label": "註冊",
                                                          "uri": "https://angleline-hall.herokuapp.com/formhtml"
                                                        }
                                                    ]
                                                }
                                            }
                                            let relogin_button =
                                                {
                                                    "type": "template",
                                                    "altText": "大講堂有消息，請借台手機開啟",
                                                    "template": {
                                                        "type": "buttons",                            
                                                        "text": "如果註冊失敗，可按我重新註冊",                            
                                                        "actions": [                                    
                                                            {
                                                                "type": "uri",
                                                                "label": "點我重新註冊",
                                                                "uri":"https://angleline-hall.herokuapp.com/formhtml"     
                                                            }
                                                        ]
                                                    }
                                            };
                                            pushmessage([text2,login_button,relogin_button,text,img],line_id)
                                            channel_array.push(line_id)
                                        }
                                    }else{
                                        let text ={
                                            "type":"text",
                                            "text":""
                                        }
                                        text.text ="您似乎使用和他人相同的電子郵件，請換個郵件註冊!\n有問題請洽詢問站";
                                        replymessage([text]);                        
                                    }
                                });
                            }else{
                                let text ={
                                    "type":"text",
                                    "text":""
                                }
                                text.text ="EASTER_EGG!請輸入註冊的郵件信箱";
                                replymessage([text]);
                            }                        

                        }else{
                            
                                let text ={
                                    "type":"text",
                                    "text":"您已經註冊了，註冊階段本站功能尚未啟用，敬請見諒"
                                }
                                replymessage([text]); 
                                                    
                        }    
                    });                    
                }else{
                    let text = {
                        "type":"text",
                        "text":"您已經註冊了，註冊階段本站功能尚未啟用，敬請見諒(您是第"+channel_array.indexOf(line_id)+"位註冊者)"
                    }
                    replymessage([text])
                }              
            }
        }
        function replymessage(recpt){ //recpt is message object
          var options = {
            url: "https://api.line.me/v2/bot/message/reply ",
            method: 'POST',
            headers: {
              'Content-Type':  'application/json', 
              'Authorization':'Bearer ' + CHANNEL_ACCESS_TOKEN
            },
            json: {
                'replyToken': replyToken,
                'messages': recpt
            }
          };  
          request(options, function (error, response, body) {
              if (error) throw error;
              console.log("(line)");
              console.log(body);
          });
          
        }        
    });

}
//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen((process.env.PORT || 8080), function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
//!!!!!

//-----------------html part --------------------------------
function FormGiver(req,res){
    res.sendFile(__dirname+'/Form/index.html');//Linux on server
}
/**function UploadPage_giver(req,res){
    res.sendFile(__dirname+'/Imgur-Upload-master/index.html');//Linux on server
}**/
function FormReceiver(req,res){
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    req.on('data', function(chunk){   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
    
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        post = querystring.parse(post);    
        console.log(post);
        psql("SELECT * FROM ACCOUNT WHERE email=\'"+ post.email +"\';").then(
            angles =>{
                if(angles.length ==0 || angles[0].angle_id==''){
                    res.end("你還沒有輸入電子郵件喔!")
                }else{
                    psql("UPDATE ACCOUNT SET angle_nickname=\'"+ post.nickname +"\' WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET master_id=\'"+ "" +"\' WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET master_name=\'"+ "" +"\' WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET head_url=\'"+ "" +"\' WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET department=\'"+ post.dept +"\' WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET self_intro=\'"+ post['self-intro'] +"\' WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET problem="+ Math.floor(6*Math.random()) +" WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET score=0 WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET ticket=0 WHERE email=\'" + post.email +"\';");
                    psql("UPDATE ACCOUNT SET groupindex="+post.group+" WHERE email=\'" + post.email +"\';");                
                    psql("UPDATE ACCOUNT SET name=\'"+ post.name +"\' WHERE email=\'" + post.email +"\';"); 
                    psql("UPDATE ACCOUNT SET phone=\'"+ post.phone +"\' WHERE email=\'" + post.email +"\';").then(
                        aa =>{       
                            //main:
                            let msg =[];
                            for(let url of graph_url){
                                let graph = {

                                    "type": "flex",
                                    "altText": "大講堂有消息，請借台手機開啟",
                                    "contents":
                                        {
                                            "type": "bubble",
                                            "header": {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                "type": "text",
                                                "text": "選擇圖片"
                                                }
                                            ]
                                            },
                                            "hero": {
                                                "type": "image",
                                                "url": url, //use 圖片位址
                                            } ,
                                            "footer": {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                "type": "spacer",
                                                "size": "xl"
                                                },
                                                {
                                                "type": "button",
                                                "action": {
                                                    "type": "postback",
                                                    "label": "按我加好友",
                                                    "data": "url="+url
                                                },
                                                "style": "primary",
                                                "color": "#ff3333"
                                                }
                                            ]
                                            }             
                                        }
                                };
                                pushmessage([graph],angles[0].angle_id);
                            }
                            let text ={
                                "type":"text",
                                "text":""
                            }
                            text.text ="請選擇頭貼(選項如上，選錯了再選一次可以cover原先選擇)，或是自行上傳頭貼(下面按鈕)";
                            
                            var upload_page = {  
                                "type": "flex",
                                "altText": "大講堂有消息，請借台手機開啟",
                                "contents":
                                    {
                                        "type": "bubble",
                                        "header": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                            "type": "text",
                                            "text": "點我自行上傳圖片(andriod記得open in other app如下圖)"
                                            }
                                        ]
                                        },
                                        "hero": {
                                            "type": "image",
                                            "url": "https://i.imgur.com/rGsgMqc.jpg", //use 圖片位址
                                        },                                        
                                        "footer": {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                            {
                                            "type": "spacer",
                                            "size": "xl"
                                            },
                                            {
                                            "type": "button",
                                            "action": {
                                                "type": "uri",
                                                "label": "按我傳圖片",
                                                "uri": "https://angleline-hall.herokuapp.com/imgGiver"
                                            },
                                            "style": "primary",
                                            "color": "#ff3333"
                                            }
                                        ]
                                        }             
                                    }
                            };
                            msg.push(text);
                            msg.push(upload_page);                            
                            pushmessage(msg,angles[0].angle_id);                                      
                        }
                    );
                
                }
                  
            }
        );
                                        
        
    });
        
}
function ImgGiver(req,res){
    res.sendFile(__dirname+'/Imgur-Upload-master/index.html');
}
function imgReceiver(req,res){
    // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
    let post='';
    req.on('data', function(chunk){   
        post += chunk;

        // Too much POST data, kill the connection!(avoid server attack)
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (post > 1e6){
                request.connection.destroy();
                console.log("!!!!!!!!!FLOD Attack!!!!!!!!");
            }                

    });
 
    // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function(){
        post = querystring.parse(post);    
        console.log(post);
        psql("UPDATE ACCOUNT SET head_url=\'"+ post.url +"\' WHERE email=\'" + post.email +"\';").then(
         aa =>{
            psql("SELECT * FROM ACCOUNT WHERE email=\'"+post.email+"\';").then(
                res =>{
                    let msg =[];
                    let text ={
                        "type":"text",
                        "text":""
                    }
                    text.text ="成功註冊!";
                    msg.push(text);
                    var ad_msg_angle = {  
                        "type": "flex",
                        "altText": "大講堂有消息，請借台手機開啟",
                        "contents":
                            {
                                "type": "bubble",
                                "header": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "按按鈕加小天使為好友"
                                    }
                                ]
                                },
                                "hero": {
                                    "type": "image",
                                    "url": "https://i.imgur.com/4Ut09xB.jpg", //use 圖片位址
                                } ,
                                "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                    "type": "spacer",
                                    "size": "xl"
                                    },
                                    {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "按我加好友",
                                        "uri": "https://line.me/R/ti/p/%40ugr1160s"
                                    },
                                    "style": "primary",
                                    "color": "#ff3333"
                                    }
                                ]
                                }             
                            }
                    };
                    var ad_msg_master = {  
                        "type": "flex",
                        "altText": "大講堂有消息，請借台手機開啟",
                        "contents":
                            {
                                "type": "bubble",
                                "header": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "按按鈕加小主人為好友"
                                    }
                                ]
                                },
                                "hero": {
                                    "type": "image",
                                    "url": "https://i.imgur.com/vQB9JKi.jpg", //use 圖片位址
                                } ,
                                "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                    "type": "spacer",
                                    "size": "xl"
                                    },
                                    {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "按我加好友",
                                        "uri": "https://line.me/R/ti/p/%40tgi5859x"
                                    },
                                    "style": "primary",
                                    "color": "#ff3333"
                                    }
                                ]
                                }             
                            }
                    };
                    var ad_msg_info = {  
                        "type": "flex",
                        "altText": "大講堂有消息，請借台手機開啟",
                        "contents":
                            {
                                "type": "bubble",
                                "header": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                    "type": "text",
                                    "text": "按按鈕加詢問站為好友"
                                    }
                                ]
                                },
                                "hero": {
                                    "type": "image",
                                    "url": "https://i.imgur.com/xffIZIN.jpg", //use 圖片位址
                                } ,
                                "footer": {
                                "type": "box",
                                "layout": "vertical",
                                "contents": [
                                    {
                                    "type": "spacer",
                                    "size": "xl"
                                    },
                                    {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "按我加好友",
                                        "uri": "https://line.me/R/ti/p/%40hzg9436s"
                                    },
                                    "style": "primary",
                                    "color": "#ff3333"
                                    }
                                ]
                                }             
                            }
                    };
                    msg.push(ad_msg_angle);
                    msg.push(ad_msg_master);
                    msg.push(ad_msg_info);
                    setTimeout(()=>{pushmessage(msg,res[0].angle_id);},3000)                   
                }
            ) 
            
         }
        );        
    });
}

