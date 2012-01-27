define(["dojo/_base/declare",
        "dijit/_Templated",
        "dijit/_Widget",
        "davinci/library",
        "system/resource",
      
        "dojo/i18n!davinci/ui/nls/ui",
        "dojo/i18n!dijit/nls/common",
        "dojo/text!./templates/newtheme.html",
        "davinci/Theme",
        "davinci/ui/widgets/ThemeSelection",
        "dijit/form/Button",
        "dijit/form/TextBox",
        "dijit/form/ValidationTextBox",
        "dijit/form/RadioButton",
        "dijit/MenuItem",
        "dijit/Menu",
        "dijit/form/TextBox",
        "dijit/form/ComboBox",
        "davinci/ui/widgets/FolderSelection",
        "davinci/ui/widgets/ThemeSelection"
        

],function(declare, _Templated, _Widget,  Library, Resource,  uiNLS, commonNLS, templateString, Theme){
	return declare("davinci.ui.NewTheme",   [dijit._Widget, dijit._Templated], {
		templateString: templateString,
		widgetsInTemplate: true,
		_themeSelection: null,
		_okButton : null,
		_folder : null,
		_themeName : null,
		_folder : null,
		_version : null,
		_selector : null,
		_themeLocation : null,
		_error1 : null,
		_error2 : null,
		_error3 : null,
		_error4 : null,
		_errorMsg : null,
	    /*
	     * CSS identifier validation RegExp
	     * 
	     * see http://www.w3.org/TR/CSS21/syndata.html#tokenization
	     * 
	     *     ident    [-]?{nmstart}{nmchar}*
	     *     nmstart  [_a-z]|{nonascii}|{escape}
	     *     nonascii [^\0-\237]
	     *     unicode  \\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
	     *     escape   {unicode}|\\[^\n\r\f0-9a-f]
	     *     nmchar   [_a-z0-9-]|{nonascii}|{escape}
	     * 
	     */             
		_themeValidator: /^[-]?([_a-z]|[^\0-\237]|\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\[^\n\r\f0-9a-f])([_a-z0-9-]|[^\0-\237]|\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\[^\n\r\f0-9a-f])*$/i,
		
		postMixInProperties : function() {
			var langObj = uiNLS;
			var dijitLangObj = commonNLS;
			dojo.mixin(this, langObj);
			dojo.mixin(this, dijitLangObj);
			this.inherited(arguments);
		},

		postCreate : function(){
			this.inherited(arguments);
			
			dojo.connect(this._themeSelection, "onChange", this, '_baseThemeChanged');
			
			/* wire up error handlers */
			dojo.connect(this._themeSelection, "onChange", this, '_checkValid');
			
			/*
			 * Override the ValidationTextBox 'validator' method.
			 */
			this._selector.validator = dojo.hitch(this, function(value, constraints) {
	            var isValid = this._themeValidator.test(value);
	            this._okButton.set( 'disabled', !isValid);
		        return isValid;
			});
			
		},
		
		_baseThemeChanged : function(){
			
			this._theme = this._themeSelection.get("value");
			
		},
		
		_createTheme : function(){
		    
	 
			var langObj = uiNLS;
			var oldTheme = this._themeSelection.attr('value');
			var selector = dojo.attr(this._selector, 'value');
			var themeName = selector;
			var version = null;
			var base = selector;
		
			var newBase = this._getThemeLocation();
			var r1=  Resource.findResource(newBase+'/'+base+'.theme');
			if(r1){
				alert(langObj.themeAlreadyExists);
			}else{
			    var basePath = this.getBase();
				var deferedList = Theme.CloneTheme(themeName,  version, selector, newBase, oldTheme, true);
				deferedList.then(function(results){
				    function findTheme(basePath, theme){
			            /* flush the theme cache after creating so new themes show up */
			            var themes = Library.getThemes(basePath, false, true);
			            var found = null;
			            for(var i=0;i<themes.length && ! found;i++){
			                if(themes[i].name==theme)
			                    found = themes[i];
			            }
			            return found;
			        }
			        var error = false;
			        for (var x=0; x < results.length; x++){
			            if(!results[x][0] ){
			                error = true;
			            }  
			        }
			        if (!error){
			            var found = findTheme(basePath, base);
			            if (found){
			                davinci.Workbench.openEditor({
			                       fileName: found.file,
			                       content: found.file.getText()});
			            } else {
			                // error message
			                alert(langObj.errorCreatingTheme + base);
			            }
			        }

			    });
			
			}
			
			
	  	},
		
		/*
		 * @return the project for the target theme.
		 */
		getBase : function(){
			if(davinci.Runtime.singleProjectMode()){
				return davinci.Runtime.getProject();
			}
		},
		
		_getThemeLocation : function(){
			
			var selector = dojo.attr(this._selector, 'value');
			
			//var resource = Resource.findResource("./themes");

			/* the directory is virtual, so create an actual instance */
			//if(resource.libraryId)
			//	resource.mkdir();
			var base = this.getBase();
			var prefs = davinci.workbench.Preferences.getPreferences('davinci.ui.ProjectPrefs',base);
			
			var projectThemeBase = (new davinci.model.Path(base).append(prefs['themeFolder']));
			
			return  projectThemeBase.append(selector).toString();
		},
		
		_checkValid : function(){
			
			var isOk = true;
			var oldTheme = this._themeSelection.attr('value');
			
			if( oldTheme==null || oldTheme =="" ) { isOk = false;}

			this._okButton.set( 'disabled', !isOk);
		},
		
		okButton : function(){
			this._createTheme();
			this.onClose();
		},
		
		cancelButton: function(){
			this.cancel = true;
			this.onClose();
		},

		onClose : function(){}


		


	});
});

