const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { problem_id, code, language_id, stdin } = req.body;

  // 1. 保存提交记录
  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({ problem_id, code, language_id, stdin, status: 'pending' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });

  // 2. 调用Judge0官方免费API，无需RapidAPI、无需注册
  try {
    const judgeRes = await axios.post(
      'https://ce.judge0.com/submissions?base64_encoded=false&wait=false',
      { source_code: code, language_id, stdin },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // 3. 更新Judge0 Token
    await supabase.from('submissions')
      .update({ judge0_token: judgeRes.data.token, status: 'judging' })
      .eq('id', submission.id);

    res.status(200).json({ submission_id: submission.id, token: judgeRes.data.token });
  } catch (e) {
    res.status(500).json({ error: '评测API调用失败：' + e.message });
  }
};
