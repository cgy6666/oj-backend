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
  if (error) throw error;

  // 2. 调用 Judge0 API
  const judgeRes = await axios.post(
    'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false',
    { source_code: code, language_id, stdin },
    {
      headers: {
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    }
  );

  // 3. 更新 Judge0 Token
  await supabase.from('submissions')
    .update({ judge0_token: judgeRes.data.token, status: 'judging' })
    .eq('id', submission.id);

  res.status(200).json({ submission_id: submission.id, token: judgeRes.data.token });
};
