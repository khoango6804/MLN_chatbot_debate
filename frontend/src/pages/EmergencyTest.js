import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api';

const EmergencyTest = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    console.log('🚨 EMERGENCY TEST PAGE LOADED!');
    alert('🚨 EMERGENCY TEST PAGE\n\nTrang này bypass hoàn toàn React cache!\nTest API trực tiếp!');
    
    // Auto-fill with timestamp to make unique
    const teamIdInput = document.getElementById('teamId');
    if (teamIdInput) {
      teamIdInput.value = `EMERGENCY_${Date.now()}`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('⏳ Đang test API...');

    try {
      const members = [
        document.getElementById('member1').value,
        document.getElementById('member2').value,
        document.getElementById('member3').value,
        document.getElementById('member4').value,
        document.getElementById('member5').value
      ].filter(m => m.trim().length > 0);

      const requestData = {
        members: members,
        course_code: document.getElementById('course').value,
        team_id: document.getElementById('teamId').value
      };

      console.log('🚨 EMERGENCY REQUEST:', requestData);

      const response = await fetch(`${API_CONFIG.baseURL}/debate/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();
      console.log('🚨 EMERGENCY RESPONSE:', responseData);

      // EMERGENCY ULTRA SIMPLE VALIDATION - Same as v7.0
      const isSuccess = response.status === 200 && responseData;

      let resultText = `🚨🚨🚨 EMERGENCY TEST RESULTS:\n\n`;
      resultText += `📊 HTTP Status: ${response.status}\n`;
      resultText += `📋 Response Data:\n${JSON.stringify(responseData, null, 2)}\n\n`;
      resultText += `🔍 VALIDATION:\n`;
      resultText += `✓ HTTP 200: ${response.status === 200}\n`;
      resultText += `✓ Has Data: ${!!responseData}\n`;
      resultText += `✓ Success Result: ${isSuccess}\n\n`;

      if (isSuccess) {
        resultText += `🎉🎉🎉 SUCCESS! API HOẠT ĐỘNG HOÀN HẢO!\n\n`;
        resultText += `✅ Backend trả về đúng format\n`;
        resultText += `✅ Message: "${responseData.message}"\n`;
        resultText += `✅ Team ID: ${responseData.data?.team_id}\n`;
        resultText += `✅ Topic: ${responseData.data?.topic}\n\n`;
        resultText += `🚀 Sẽ điều hướng đến: /debate/${requestData.team_id}`;

        // Auto navigate after 3 seconds
        setTimeout(() => {
          if (window.confirm('🎉 Test thành công! Điều hướng đến phòng debate?')) {
            navigate(`/debate/${requestData.team_id}`);
          }
        }, 3000);

      } else {
        resultText += `❌ VALIDATION FAILED!\n`;
        resultText += `❌ Status: ${response.status}\n`;
        resultText += `❌ Data: ${!!responseData}`;
      }

      setResult(resultText);

    } catch (error) {
      console.error('💥 EMERGENCY ERROR:', error);
      let resultText = `💥💥💥 LỖI EMERGENCY:\n\n`;
      resultText += `❌ Error: ${error.message}\n`;
      resultText += `❌ Có thể là vấn đề mạng hoặc CORS\n`;
      resultText += `❌ Kiểm tra console để biết thêm chi tiết`;

      setResult(resultText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      margin: '20px',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.95)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        color: '#333'
      }}>
        <div style={{
          background: '#ff6b6b',
          color: 'white',
          textAlign: 'center',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: 'bold',
          fontSize: '18px',
          animation: 'pulse 2s infinite'
        }}>
          🚨 EMERGENCY TEST PAGE - BYPASS REACT CACHE 🚨
        </div>

        <h1 style={{
          color: '#e74c3c',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5em',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          🚨 Emergency MLN Debate Test
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              🆔 Team ID:
            </label>
            <input
              type="text"
              id="teamId"
              defaultValue={`EMERGENCY_${Date.now()}`}
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              👤 Thành viên 1:
            </label>
            <input
              type="text"
              id="member1"
              defaultValue="Nguyễn Văn A"
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              👤 Thành viên 2:
            </label>
            <input
              type="text"
              id="member2"
              defaultValue="Trần Thị B"
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              👤 Thành viên 3:
            </label>
            <input
              type="text"
              id="member3"
              defaultValue="Lê Văn C"
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              👤 Thành viên 4:
            </label>
            <input
              type="text"
              id="member4"
              defaultValue="Phạm Thị D"
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              👤 Thành viên 5:
            </label>
            <input
              type="text"
              id="member5"
              defaultValue="Hoàng Văn E"
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ margin: '20px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
              📚 Môn học:
            </label>
            <select
              id="course"
              required
              style={{
                width: '100%',
                padding: '15px',
                border: '3px solid #3498db',
                borderRadius: '10px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            >
              <option value="MLN111+MLN122">MLN111+MLN122 - Triết học & Kinh tế Chính trị Marx - Lenin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              margin: '15px 0'
            }}
          >
            {loading ? '⏳ Đang test...' : '🚀 BẮT ĐẦU TRANH LUẬN NGAY!'}
          </button>
        </form>

        {result && (
          <div style={{
            margin: '25px 0',
            padding: '20px',
            borderRadius: '10px',
            fontFamily: '"Courier New", monospace',
            whiteSpace: 'pre-wrap',
            borderLeft: '5px solid',
            background: result.includes('SUCCESS') ? '#d5edda' : result.includes('LỖI') ? '#f8d7da' : '#d1ecf1',
            borderColor: result.includes('SUCCESS') ? '#28a745' : result.includes('LỖI') ? '#dc3545' : '#17a2b8',
            color: result.includes('SUCCESS') ? '#155724' : result.includes('LỖI') ? '#721c24' : '#0c5460'
          }}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyTest; 