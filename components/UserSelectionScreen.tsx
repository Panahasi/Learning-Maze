
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface UserSelectionScreenProps {
    onUserSelect: (user: User) => void;
    users: User[];
    setUsers: (users: User[] | ((prevUsers: User[]) => User[])) => void;
}

const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ onUserSelect, users, setUsers }) => {
    const [loginMode, setLoginMode] = useState<'student' | 'teacher'>('student');
    
    // Student state
    const [studentName, setStudentName] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Teacher state
    const [teacherUsername, setTeacherUsername] = useState('');
    const [teacherPassword, setTeacherPassword] = useState('');
    const [teacherLoginError, setTeacherLoginError] = useState('');
    
    // Captcha state
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    useEffect(() => {
        const defaultTeacherId = 'teacher-admin';
        const defaultTeacherName = 'Teacher';
        const defaultTeacherPassword = 'SchoolAdmin2025!';

        const existingDefault = users.find(u => u.id === defaultTeacherId);
        
        // If default teacher exists but has wrong credentials/name, update it
        if (existingDefault) {
            if (existingDefault.name !== defaultTeacherName || existingDefault.password !== defaultTeacherPassword) {
                 setUsers(prev => prev.map(u => u.id === defaultTeacherId ? { ...u, name: defaultTeacherName, password: defaultTeacherPassword } : u));
            }
        } 
        // If no teacher exists at all, create default
        else if (!users.some(u => u.role === 'teacher')) {
             setUsers(prev => [...prev, {
                id: defaultTeacherId,
                name: defaultTeacherName,
                role: 'teacher',
                email: 'teacher@example.com',
                password: defaultTeacherPassword
            }]);
             console.info(`Default teacher account created. Username: ${defaultTeacherName}, Password: ${defaultTeacherPassword}`);
        }
    }, [users, setUsers]);

    const generateCaptcha = () => {
        setCaptcha({
            num1: Math.floor(Math.random() * 10),
            num2: Math.floor(Math.random() * 10)
        });
        setCaptchaAnswer('');
    };

    const handleSwitchToTeacher = () => {
        setLoginMode('teacher');
        generateCaptcha();
        setTeacherLoginError('');
        setTeacherUsername('');
        setTeacherPassword('');
    };

    const handleSwitchToStudent = () => {
        setLoginMode('student');
        setLoginError('');
        setStudentName('');
        setStudentPassword('');
    };

    const handleStudentLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const name = studentName.trim();
        const password = studentPassword.trim();
        setLoginError('');

        const student = users.find(u => u.role === 'student' && u.name.toLowerCase() === name.toLowerCase());

        if (!student) {
            setLoginError('Student not found. Please check your name.');
            return;
        }

        if (student.password) { // Account has a password
            if (password === student.password) {
                onUserSelect(student);
            } else {
                setLoginError('Incorrect password. Please try again.');
            }
        } else { // Account does not have a password
            if (password) { // User entered a password anyway
                setLoginError('This account does not have a password. Leave the password field empty.');
            } else { // Correctly left empty
                onUserSelect(student);
            }
        }
    };

    const handleTeacherLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Verify Captcha
        const expectedSum = captcha.num1 + captcha.num2;
        if (parseInt(captchaAnswer) !== expectedSum) {
             setTeacherLoginError('Incorrect captcha answer. Please try again.');
             generateCaptcha();
             return;
        }

        const teacher = users.find(u => u.role === 'teacher' && u.name.toLowerCase() === teacherUsername.trim().toLowerCase());
        
        if (teacher && teacher.password === teacherPassword) {
            onUserSelect(teacher);
        } else {
            setTeacherLoginError('Invalid username or password.');
            generateCaptcha(); // Reset captcha on failed login
        }
    }

    return (
        <div className="w-full h-screen md:h-auto md:max-w-md mx-auto p-8 bg-white/90 md:rounded-3xl md:shadow-2xl backdrop-blur-lg md:border border-gray-200 flex flex-col justify-center">
            {loginMode === 'student' ? (
                <>
                    <h1 className="text-4xl font-black text-blue-600 mb-6 tracking-tight text-center">Student Login</h1>
                    <form onSubmit={handleStudentLogin} className="space-y-4">
                        <input 
                            type="text"
                            value={studentName}
                            onChange={(e) => { setStudentName(e.target.value); setLoginError(''); }}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Enter your name"
                            aria-label="Student Name"
                            autoFocus
                        />
                        <input 
                            type="password"
                            value={studentPassword}
                            onChange={(e) => { setStudentPassword(e.target.value); setLoginError(''); }}
                            className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Password (if you have one)"
                            aria-label="Password"
                        />
                        {loginError && <p className="text-red-500 text-sm text-center font-bold">{loginError}</p>}
                        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl text-2xl hover:bg-blue-600 transition-transform hover:scale-105 shadow-lg">
                            Login
                        </button>
                    </form>
                    <div className="text-center mt-6 border-t pt-6">
                        <button onClick={handleSwitchToTeacher} className="text-blue-600 font-semibold hover:underline">Are you a teacher? Login here.</button>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-4xl font-black text-blue-600 mb-6 tracking-tight text-center">Teacher Login</h1>
                    <form onSubmit={handleTeacherLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1 ml-1 text-sm">Username</label>
                            <input 
                                type="text" 
                                value={teacherUsername} 
                                onChange={(e) => { setTeacherUsername(e.target.value); setTeacherLoginError(''); }} 
                                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                placeholder="Username" 
                                aria-label="Teacher username" 
                                autoFocus 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-1 ml-1 text-sm">Password</label>
                            <input 
                                type="password" 
                                value={teacherPassword} 
                                onChange={(e) => { setTeacherPassword(e.target.value); setTeacherLoginError(''); }} 
                                className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                placeholder="Password" 
                                aria-label="Teacher password" 
                            />
                        </div>

                        {/* Captcha Field */}
                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
                             <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Security Check</label>
                             <div className="flex items-center gap-3">
                                 <div className="bg-white px-4 py-2 rounded-lg border-2 border-gray-300 font-mono text-xl font-bold text-gray-600 select-none">
                                     {captcha.num1} + {captcha.num2} = ?
                                 </div>
                                 <input 
                                    type="number" 
                                    value={captchaAnswer}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                    className="w-20 p-2 border-2 border-gray-300 rounded-lg text-lg text-center font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="?"
                                    aria-label="Captcha Answer"
                                 />
                                 <button type="button" onClick={generateCaptcha} className="text-blue-500 hover:text-blue-700 text-sm font-bold underline">
                                     Refresh
                                 </button>
                             </div>
                        </div>

                        {teacherLoginError && <p className="text-red-500 text-sm text-center font-bold">{teacherLoginError}</p>}
                        <button type="submit" className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl text-2xl hover:bg-blue-600 transition-transform hover:scale-105 shadow-lg">
                            Login
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={handleSwitchToStudent} className="text-blue-600 font-semibold hover:underline">Back to Student Login</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default UserSelectionScreen;
