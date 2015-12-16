module.exports = function(grunt){
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
	
	var isForAllBranding = grunt.option('isForAllBranding'),
		isForProcCatalog = grunt.option('isForProcCatalog'),
		objIndex = 0,
		filesobj = {},
		availableBranding = grunt.file.readJSON('branding.json').data;
	
	gruntInitConfig();
	
	function gruntInitConfig(){
		grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			cssSourceFolder: 'css',
			htmlhint: {
				build: {
					options: {
						'tag-pair': true,
						'tagname-lowercase': true,
						'attr-lowercase': true,
						'attr-value-double-quotes': true,
						'doctype-first': true,
						'spec-char-escape': true,
						'id-unique': true,
						'head-script-disabled': true,
						'style-disabled': true
					},
					src: ['index.html']
				}
			},
			concat_css: {
				options: {
					// Task-specific options go here. 
					
				},
				all: {
					src: ["../grid.css", "../jquery.treeview.css"],
					dest: "../branding/styles.css"
				},
			},
			
			concat: {
				options: {
					separator: '\n\n---New file---\n\n',
					// Replace all 'use strict' statements in the code with a single one at the top
					banner: "'use strict';\n",
					process: function(src, filepath) {
					  return '// Source: ' + filepath + '\n' +
						src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
					},
				},
				dist: {
					src: ['../jquery.contextMenu.css', '../jquery.treeview.css'],
					dest: "../branding/styles.css",
				},
			},
			
			imagemin: {                          // Task
				dynamic: {                         // Another target
					files: [{
						expand: true,                  // Enable dynamic expansion
						cwd: '../../images/',                   // Src matches are relative to this path
						src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
						dest: '../../images/'                  // Destination path prefix
					}]
				}
			},
			
			sass: {
				dist: {
					files: filesobj
				},
				options: {
					style: 'expanded',
					require: ['sass-json-vars'],
					update: true,
					sourcemap: 'none',
					trace: true
				}
			},

			watch: {
				html: {
					files: ['index.html'],
					tasks: ['htmlhint']
				},
				sass: {
					files: ['src/sass/**/*.scss','src/sass/**/*.json'],
					tasks: ['sass']
				}
			}
		});
	}
	
	grunt.registerTask('loadAllBranding', function () {
		var singleData = availableBranding[objIndex],
			done = this.async();
		setTimeout(function() {			
			var isAvailBrandInfoUrl = false;
			var displayVal = "block";
			if(singleData.brandingInfoUrl){
				isAvailBrandInfoUrl = true;
			}
			if(singleData.displayVal){
				displayVal = singleData.displayVal;
			}
			grunt.file.write('src/sass/config.scss', '$isReqLHPanelBgImg:"' + singleData.isReqLHPanelBgImg + 
													'";\n$isAvailBrandInfoUrl:"' + isAvailBrandInfoUrl + 
													'";\n$brandingId:"' + singleData.brandingId +
													'";\n$displayVal:"' + displayVal +													
													'";\n@import "' + singleData.brandingId + '.json";'
							);
			var brandingCssPath = "../branding/custom_"+singleData.brandingId+".css";
			filesobj[brandingCssPath] = 'src/sass/build.scss';
			done();
		},1000);
	});
	
	grunt.registerTask('taskDone', function () {
		if(objIndex <= availableBranding.length - 1){
			var singleData = availableBranding[objIndex];
			var fileData = grunt.file.read("../branding/custom_"+singleData.brandingId+".css");
			grunt.file.write("../branding/custom_"+singleData.brandingName+".css", fileData);
			objIndex++;
			filesobj = {};
			gruntInitConfig();
			grunt.task.run('default');
		}
	});
	
	grunt.registerTask('config', function () {
		function retunrRow(brandingId){
			var len = availableBranding.length;
			var rowData = null;
			for(var i=0;i<=len-1;i++){
				rowData = availableBranding[i];
				if(rowData.brandingId == brandingId){
					return rowData;
				}
			}
			return rowData;
		}
		var singleData = retunrRow(grunt.option('brandingId'));
		console.log(singleData);
		var displayVal = "block";
		var isAvailBrandInfoUrl = false;
		if(singleData && singleData.displayVal){
			displayVal = singleData.displayVal;
		}
		if(singleData && singleData.brandingInfoUrl !== ""){
			isAvailBrandInfoUrl = true;
		}
		grunt.file.write('src/sass/config.scss', '$isReqLHPanelBgImg:"' + grunt.option('isReqLHPanelBgImg') + 
												'";\n$isAvailBrandInfoUrl:"' + isAvailBrandInfoUrl + 
												'";\n$brandingId:"' + grunt.option('brandingId') + 
												'";\n$displayVal:"' + displayVal +
												'";\n@import "' + grunt.option('brandingId') + '.json";'
						);
	});
	
	grunt.registerTask("proc-catalog-config", function(){
		var brandingCssPath = "../proc-catlog-config.css";
		filesobj[brandingCssPath] = 'src/sass/proc-catalog.scss'
	});
	
	if(isForAllBranding){
		grunt.registerTask('default', ['loadAllBranding','sass','taskDone']);
	}else if(isForProcCatalog){
		grunt.registerTask('default', ['proc-catalog-config','sass']);
	}else{
		var brandingCssPath = "../branding/custom_"+grunt.option('brandingId')+".css";
		filesobj[brandingCssPath] = 'src/sass/build.scss';
		grunt.registerTask('default', ['config','sass']);
	}
	grunt.loadNpmTasks('grunt-concat-css');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.registerTask('concat-css', ['concat_css']);
	grunt.registerTask('concat_task', ['concat']);
	grunt.registerTask('imageOptimize', ['imagemin']);
};