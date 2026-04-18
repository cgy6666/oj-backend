const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { submission_id, token } = req.query;

  try {
    // 1. 从Judge0官方免费API获取结果
    const judgeRes = await axios.get(
      `https://ce.judge0.com/submissions/${token}?base64_encoded=false`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const result = judgeRes.data;

    // 2. 更新数据库
    await supabase.from('submissions').update({
      status: 'completed',
      result: result.status?.description || 'Unknown',
      stdout: result.stdout,
      stderr: result.stderr,
      time: result.time,
      memory: result.memory
    }).eq('id', submission_id);

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: '获取评测结果失败：' + e.message });
  }
};
