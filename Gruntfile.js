module.exports=function(grunt){

	//配置项目
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json');
	});
	//加载任务
	grunt.loadNpmTasks();
	//默认任务
	grunt.registerTask('default',[]);
}