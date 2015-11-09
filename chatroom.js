//聊天数据
Chatlists = new Mongo.Collection("chatlists");
//在线用户列表
OnlineUsers = new Mongo.Collection("onlineUsers");

if (Meteor.isServer) {

	Meteor.publish("chatlists", function () {

		var userid = this.userId;
		//监听用户下线
		this.onStop(function(){
			if(userid){

				OnlineUsers.remove(userid);
			}else{
				// console.log(Session.get("amid"));
				// OnlineUsers.remove(Session.get("amid"));
			}
			
		});
		return Chatlists.find();
	});

	Meteor.publish("onlineUsers", function () {
		return OnlineUsers.find();
	});
}

if (Meteor.isClient) {

	Meteor.subscribe("chatlists");
	Meteor.subscribe("onlineUsers");

	Template.body.helpers({
		chatlists: function() {

			return Chatlists.find();
		},
		//获取在线用户列表
		onlinelists:function(){

			return OnlineUsers.find();
		},
		//用户上线回调
		loginCallback:function(){

			var user = Meteor.user();
			if(user){
				Meteor.call("addOnlineList", user);
			}else{
				// var amid ='Am'+Number((new Date()).getTime()+parseInt(Math.random()*100000)).toString(16);
				// Meteor.call("addOnlineList",{
				// 	username:'匿名',
				// 	userId:amid
				// });
				// console.log(amid);
				// Session.set("amid", amid);
			}
		}
	});

	Template.body.events({
		"click #submit": function(event) {

			event.preventDefault();
			evt = event;

			var text = $('#textInput').val();
			if(!text){
				return;
			}
			Meteor.call("addChatlist", text);

			// Clear form
			var text = $('#textInput').val('');
			$('.chatScrl').scrollTop($('.chatList').height()-$('.chatScrl').height());
		}
	});
	Template.chatlist.events({
		"click .removeBtn": function(event) {

			event.preventDefault();
			evt = event;

			Meteor.call("deleteChatlist",this._id);
			$('.chatScrl').scrollTop($('.chatList').height()-$('.chatScrl').height());
		}
	});

	Template.chatlist.helpers({
		isNotowner: function() {   

			setTimeout(function(){$('.chatScrl').scrollTop($('.chatList').height()-$('.chatScrl').height());},500);
			return this.owner !== Meteor.userId();
		}
	});

	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
	//进入时，使滚动条在最底部
	Meteor.setTimeout(function(){
		$('.chatScrl').scrollTop($('.chatList').height()-$('.chatScrl').height());
	},1000);
}

Meteor.methods({
	addChatlist: function(text) {

		if (!Meteor.userId()) {
			throw new Meteor.Error("not-authorized");
		}

		Chatlists.insert({
			text: text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username
		});
	},
	deleteChatlist: function(taskId) {

		var chatlist = Chatlists.findOne(taskId);
		if (chatlist.owner === Meteor.userId()||Meteor.user().username == 'eureka7even') {
			Chatlists.remove(taskId);
		}
	},
	//记录在线用户
	addOnlineList:function(user){

		OnlineUsers.insert(user);
	}
});
