export default {
  DSLProtectIdenfifyName: ['$rm', '$data', '$tm', '$templates'], //  DSL 保留的变量名称
  GlobalIdentifyNames: ['runtime', 'Date', 'Math', 'JSON', 'window'] // 全局变量名称。这里的变量是系统级变量。仅仅是忽略，但不会报错。
}
