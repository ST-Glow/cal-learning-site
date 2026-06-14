window.CAL_CONFIG = {
  knowledgeVideoUrl: "assets/videos/knowledge-explanation.mp4",
  knowledgeVideoLabel: "观看知识讲解",

  videos: {
    "情景导入": "assets/videos/scenario-introduction.mp4",
    "知识讲解": "assets/videos/knowledge-explanation.mp4",
    "古涛老师讲解": "assets/videos/teacher-gu-tao-lecture.mp4"
  },

  // 填入学校允许使用的轻量 API 或在线表单接收地址。
  submissionEndpoint: "",

  // DeepSeek 请求由 server.mjs 代理，浏览器中不保存 API Key。
  assistantEndpoint: window.location.hostname.endsWith("github.io") ? "" : "/api/assistant",
  assistantName: "小柿老师"
};
