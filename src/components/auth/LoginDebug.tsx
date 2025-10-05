import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LoginDebug: React.FC = () => {
  const [testEmail, setTestEmail] = useState(`test${Date.now()}@gmail.com`);
  const [testPassword, setTestPassword] = useState('password123');
  const [result, setResult] = useState<string>('');

  const testLogin = async () => {
    setResult('Testing login...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setResult(`⚠️ Email not confirmed: ${error.message}. Check your email for verification link.`);
        } else {
          setResult(`❌ Error: ${error.message}`);
        }
      } else {
        setResult(`✅ Success: Logged in as ${data.user?.email}`);
      }
    } catch (err) {
      setResult(`Exception: ${err}`);
    }
  };

  const testSignup = async () => {
    setResult('Testing signup...');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setResult(`❌ Signup Error: ${error.message}`);
      } else {
        setResult(`✅ User created: ${data.user?.email}. Check your email for verification link.`);
      }
    } catch (err) {
      setResult(`Exception: ${err}`);
    }
  };

  const checkConnection = async () => {
    setResult('Checking connection...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) {
        setResult(`❌ Connection error: ${error.message}`);
      } else {
        setResult('✅ Connection successful!');
      }
    } catch (err) {
      setResult(`❌ Connection exception: ${err}`);
    }
  };

  const resendVerification = async () => {
    setResult('Resending verification email...');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: testEmail,
      });
      
      if (error) {
        setResult(`❌ Resend error: ${error.message}`);
      } else {
        setResult(`✅ Verification email sent to ${testEmail}`);
      }
    } catch (err) {
      setResult(`❌ Resend exception: ${err}`);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Test Email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Test Password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
          />
        </div>
        <div className="space-x-2 flex flex-wrap gap-2">
          <Button onClick={checkConnection} variant="outline" size="sm">
            Test Connection
          </Button>
          <Button onClick={testSignup} variant="outline" size="sm">
            Test Signup
          </Button>
          <Button onClick={testLogin} size="sm">
            Test Login
          </Button>
          <Button onClick={resendVerification} variant="outline" size="sm">
            Resend Email
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {result}
        </div>
      </CardContent>
    </Card>
  );
};
