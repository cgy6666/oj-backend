// api/problems.js
const express = require('express');
const router = express.Router();

// 模拟题目列表数据（实际应从数据库查询）
const problemsList = [
  { id: 1, title: '两数之和', desc: '给定一个整数数组...', difficulty: '简单' },
  { id: 2, title: '有效的括号', desc: '给定一个只包括...', difficulty: '简单' }
];

// 获取题目列表接口（GET 请求）
router.get('/problems', (req, res) => {
  try {
    // 正确返回 JSON 格式数据 + 200 状态码
    res.status(200).json({
      code: 200,
      msg: '获取题目列表成功',
      data: problemsList
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      error: err.message
    });
  }
});

module.exports = router;
