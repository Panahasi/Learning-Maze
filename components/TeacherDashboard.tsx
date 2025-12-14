
import React, { useState, useMemo } from 'react';
import { User, GameSession, GameMode, Achievement } from '../types';
import { LogoutIcon, UserIcon, PencilIcon, TrashIcon, ExportIcon, MedalIcon, StarIcon, TrophyIcon, FireIcon, LightningIcon, ScrollIcon, CheckIcon, CrossIcon } from './icons';
import ResultsScreen from './ResultsScreen';
import { TOTAL_ROOMS } from '../constants';
import { ACHIEVEMENTS } from '../services/achievementService';


interface TeacherDashboardProps {
  allUsers: User[];
  gameHistory: Record<string, GameSession[]>;
  onLogout: () => void;
  onUpdateUsers: (value: User[] | ((prevUsers: User[]) => User[])) => void;
  onUpdateGameHistory: (value: Record<string, GameSession[]> | ((prevHistory: Record<string, GameSession[]>) => Record<string, GameSession[]>)) => void;
  onManageSets: (mode: GameMode) => void;
  userAchievements: Record<string, string[]>;
  onUpdateAchievements: (value: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
  customAchievements: Achievement[];
  onUpdateCustomAchievements: (value: Achievement[] | ((prev: Achievement[]) => Achievement[])) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ allUsers, gameHistory, onLogout, onUpdateUsers, onUpdateGameHistory, onManageSets, userAchievements, onUpdateAchievements, customAchievements, onUpdateCustomAchievements }) => {
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [editFormState, setEditFormState] = useState({ name: '', password: '' });
  
  const [managingBadgesStudent, setManagingBadgesStudent] = useState<User | null>(null);
  const [creatingBadge, setCreatingBadge] = useState(false);
  const [newBadgeForm, setNewBadgeForm] = useState({ title: '', description: '', icon: 'star' as Achievement['icon'] });
  
  // State for adding a new student
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [addStudentError, setAddStudentError] = useState('');

  const studentUsers = allUsers.filter(u => u.role === 'student');
  const allAvailableAchievements = useMemo(() => [...ACHIEVEMENTS, ...customAchievements], [customAchievements]);

  const handleStartEdit = (student: User) => {
    setEditingStudent(student);
    setEditFormState({ name: student.name, password: '' });
  };
  
  const handleCancelEdit = () => {
    setEditingStudent(null);
    setEditFormState({ name: '', password: '' });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStudentName.trim();
    if (!name) {
      setAddStudentError("Student name cannot be empty.");
      return;
    }

    const nameExists = allUsers.some(user => user.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
      setAddStudentError(`A user with the name "${name}" already exists.`);
      return;
    }

    const newUser: User = {
      id: `student-${Date.now()}`,
      name: name,
      role: 'student',
      password: newStudentPassword.trim() || undefined,
    };

    onUpdateUsers(prevUsers => [...prevUsers, newUser]);
    setNewStudentName('');
    setNewStudentPassword('');
    setAddStudentError('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const newName = editFormState.name.trim();
    if (!newName) {
      alert("Student name cannot be empty.");
      return;
    }
    
    const nameExists = allUsers.some(user => user.id !== editingStudent.id && user.name.toLowerCase() === newName.toLowerCase());
    if (nameExists) {
      alert(`A user with the name "${newName}" already exists.`);
      return;
    }

    onUpdateUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.id === editingStudent.id) {
          return {
            ...user,
            name: newName,
            // Only update password if a new one is provided
            password: editFormState.password ? editFormState.password.trim() : user.password,
          };
        }
        return user;
      })
    );
    
    handleCancelEdit(); // Close modal and reset state
  };
  
  const handleToggleSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleAll = () => {
    if (selectedUserIds.length === studentUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(studentUsers.map(u => u.id));
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedUserIds.length} selected student(s)? This will also delete all their game history.`)) {
      onUpdateUsers(prevUsers => prevUsers.filter(user => !selectedUserIds.includes(user.id)));
      
      onUpdateGameHistory(prevHistory => {
        const newHistory = { ...prevHistory };
        selectedUserIds.forEach(id => {
          delete newHistory[id];
        });
        return newHistory;
      });

      setSelectedUserIds([]);
    }
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}? This will also delete all their game history.`)) {
      onUpdateUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      onUpdateGameHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[userToDelete.id];
        return newHistory;
      });
    }
  };

  const handleToggleAchievement = (userId: string, achievementId: string) => {
    onUpdateAchievements(prev => {
        const current = prev[userId] || [];
        const newAchievements = current.includes(achievementId) 
            ? current.filter(id => id !== achievementId)
            : [...current, achievementId];
        return { ...prev, [userId]: newAchievements };
    });
  };
  
  const handleCreateCustomBadge = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBadgeForm.title.trim()) return;

      const newBadge: Achievement = {
          id: `custom_badge_${Date.now()}`,
          title: newBadgeForm.title,
          description: newBadgeForm.description || 'Teacher Award',
          icon: newBadgeForm.icon
      };

      onUpdateCustomAchievements(prev => [...prev, newBadge]);
      setCreatingBadge(false);
      setNewBadgeForm({ title: '', description: '', icon: 'star' });
  };


  const exportToCsv = (filename: string, csvData: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportSelected = () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one student to export.");
      return;
    }

    const headers = ["Student Name", "Session ID", "Date", "Set Name", "Mode", "Time (s)", "Score", "Question No.", "Question", "Your Answer", "Correct Answer", "Was Correct"];
    let rows: string[][] = [];

    selectedUserIds.forEach(userId => {
      const user = allUsers.find(u => u.id === userId);
      const userHistory = gameHistory[userId] || [];
      if (!user) return;

      userHistory.forEach(session => {
        if (session.results.length > 0) {
          session.results.forEach((result, index) => {
            rows.push([
              `"${user.name}"`,
              `"${session.id}"`,
              `"${new Date(session.date).toLocaleString()}"`,
              `"${session.setName.replace(/"/g, '""')}"`,
              `"${session.mode}"`,
              session.time.toString(),
              `"${session.score}/${TOTAL_ROOMS}"`,
              (index + 1).toString(),
              `"${result.question.question.replace(/"/g, '""')}"`,
              `"${String(result.userAnswer).replace(/"/g, '""')}"`,
              `"${String(result.question.correctAnswer).replace(/"/g, '""')}"`,
              result.isCorrect ? "Yes" : "No",
            ]);
          });
        } else {
            rows.push([
              `"${user.name}"`,
              `"${session.id}"`,
              `"${new Date(session.date).toLocaleString()}"`,
              `"${session.setName.replace(/"/g, '""')}"`,
              `"${session.mode}"`,
              session.time.toString(),
              `"${session.score}/${TOTAL_ROOMS}"`,
              "-", "-", "-", "-", "-",
            ]);
        }
      });
    });

    if (rows.length === 0) {
      alert("No game history found for the selected students.");
      return;
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    exportToCsv(`student_data_export_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  };

  const renderIcon = (iconName: Achievement['icon'], className: string) => {
    switch(iconName) {
        case 'trophy': return <TrophyIcon className={className} />;
        case 'star': return <StarIcon className={className} />;
        case 'medal': return <MedalIcon className={className} />;
        case 'fire': return <FireIcon className={className} />;
        case 'lightning': return <LightningIcon className={className} />;
        case 'scroll': return <ScrollIcon className={className} />;
        default: return <StarIcon className={className} />;
    }
  }


  if (viewingStudent) {
    return <ResultsScreen user={viewingStudent} onExit={() => setViewingStudent(null)} />;
  }

  return (
    <>
      <div className="w-full h-screen md:h-auto md:max-w-4xl mx-auto p-4 md:p-6 bg-white/90 md:rounded-3xl md:shadow-2xl backdrop-blur-lg md:border border-gray-200 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 pb-4 border-b">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-blue-600 tracking-tight">Teacher Dashboard</h1>
            <p className="text-gray-600">{studentUsers.length} student(s) enrolled.</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-red-50" title="Logout">
            <span>Logout</span>
            <LogoutIcon className="w-6 h-6"/>
          </button>
        </div>

        <div className="my-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-xl font-bold text-gray-700 mb-3">Manage Question Sets</h3>
            <p className="text-gray-600 mb-4">Create, edit, or delete the question sets that students will use in the game.</p>
            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => onManageSets(GameMode.Math)} className="flex-1 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition shadow text-lg">
                    🧮 Manage Math Sets
                </button>
                <button onClick={() => onManageSets(GameMode.Spelling)} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition shadow text-lg">
                    ✍️ Manage Spelling Sets
                </button>
            </div>
        </div>

        <div className="my-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-xl font-bold text-gray-700 mb-3">Add New Student</h3>
           <form onSubmit={handleAddStudent} className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="flex-1 w-full">
                  <label htmlFor="new-student-name" className="block text-sm font-medium text-gray-600">Student Name</label>
                  <input
                      id="new-student-name"
                      type="text"
                      value={newStudentName}
                      onChange={(e) => { setNewStudentName(e.target.value); setAddStudentError(''); }}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g., Jane Doe"
                  />
              </div>
              <div className="flex-1 w-full">
                  <label htmlFor="new-student-password" className="block text-sm font-medium text-gray-600">Password (optional)</label>
                  <input
                      id="new-student-password"
                      type="password"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                      placeholder="Leave blank for no password"
                  />
              </div>
              <button type="submit" className="w-full md:w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition shadow">
                  Add Student
              </button>
          </form>
          {addStudentError && <p className="text-red-500 text-sm mt-2">{addStudentError}</p>}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-gray-700">Bulk Actions:</h3>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
                onClick={handleDeleteSelected}
                disabled={selectedUserIds.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow"
            >
                <TrashIcon className="w-5 h-5" />
                <span className="md:hidden">Delete</span>
                <span className="hidden md:inline">Delete Selected</span>
            </button>
            <button
                onClick={handleExportSelected}
                disabled={selectedUserIds.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow"
            >
                <ExportIcon className="w-5 h-5" />
                 <span className="md:hidden">Export</span>
                 <span className="hidden md:inline">Export Selected</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5"
                    checked={studentUsers.length > 0 && selectedUserIds.length === studentUsers.length}
                    onChange={handleToggleAll}
                    aria-label="Select all students"
                  />
                </th>
                <th className="p-4 font-bold text-gray-700">Student</th>
                <th className="p-4 font-bold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentUsers.length > 0 ? studentUsers.map(student => (
                <tr key={student.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={selectedUserIds.includes(student.id)}
                      onChange={() => handleToggleSelection(student.id)}
                      aria-label={`Select ${student.name}`}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <span className="text-lg font-bold text-gray-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => setManagingBadgesStudent(student)} 
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition shadow flex items-center gap-1"
                      >
                        <MedalIcon className="w-4 h-4" /> <span className="hidden sm:inline">Badges</span>
                      </button>
                      <button 
                        onClick={() => setViewingStudent(student)} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow"
                      >
                        Progress
                      </button>
                      <button 
                        onClick={() => handleStartEdit(student)} 
                        title={`Edit ${student.name}`}
                        className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-full transition"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(student)}
                        title={`Delete ${student.name}`}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    No students have been created yet. Use the form above to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Student: {editingStudent.name}</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="mb-4">
                <label className="block font-bold mb-2 text-gray-700">Student Name</label>
                <input
                  type="text"
                  value={editFormState.name}
                  onChange={e => setEditFormState(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block font-bold mb-2 text-gray-700">New Password (optional)</label>
                <input
                  type="password"
                  value={editFormState.password}
                  onChange={e => setEditFormState(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={handleCancelEdit} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {managingBadgesStudent && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b">
                      <div>
                        <h2 className="text-2xl font-black text-gray-800">Manage Badges</h2>
                        <p className="text-gray-600 font-semibold">{managingBadgesStudent.name}</p>
                      </div>
                      <button onClick={() => { setManagingBadgesStudent(null); setCreatingBadge(false); }} className="text-gray-400 hover:text-gray-800 text-3xl font-bold leading-none">&times;</button>
                  </div>
                  
                  {creatingBadge ? (
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-4">
                           <h3 className="font-bold text-lg text-gray-800 mb-4">Create Custom Badge</h3>
                           <form onSubmit={handleCreateCustomBadge}>
                               <div className="mb-3">
                                   <label className="block text-sm font-bold text-gray-700 mb-1">Badge Title</label>
                                   <input type="text" required value={newBadgeForm.title} onChange={e => setNewBadgeForm(prev => ({...prev, title: e.target.value}))} className="w-full p-2 border rounded" placeholder="e.g. Good Behavior"/>
                               </div>
                               <div className="mb-3">
                                   <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                   <input type="text" value={newBadgeForm.description} onChange={e => setNewBadgeForm(prev => ({...prev, description: e.target.value}))} className="w-full p-2 border rounded" placeholder="e.g. For helping others"/>
                               </div>
                               <div className="mb-4">
                                   <label className="block text-sm font-bold text-gray-700 mb-1">Icon</label>
                                   <div className="flex gap-2 flex-wrap">
                                       {['trophy', 'star', 'medal', 'fire', 'lightning', 'scroll'].map(icon => (
                                           <button 
                                            key={icon} 
                                            type="button"
                                            onClick={() => setNewBadgeForm(prev => ({...prev, icon: icon as any}))}
                                            className={`p-2 rounded-lg border-2 ${newBadgeForm.icon === icon ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent bg-gray-200 text-gray-500'}`}
                                           >
                                               {renderIcon(icon as any, "w-6 h-6")}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                               <div className="flex gap-3">
                                   <button type="button" onClick={() => setCreatingBadge(false)} className="flex-1 py-2 bg-gray-200 font-bold text-gray-600 rounded hover:bg-gray-300">Cancel</button>
                                   <button type="submit" className="flex-1 py-2 bg-green-500 font-bold text-white rounded hover:bg-green-600 shadow">Create Badge</button>
                               </div>
                           </form>
                      </div>
                  ) : (
                      <button onClick={() => setCreatingBadge(true)} className="mb-6 w-full py-3 bg-purple-100 text-purple-700 font-bold rounded-xl border-2 border-dashed border-purple-300 hover:bg-purple-200 hover:border-purple-400 transition flex items-center justify-center gap-2">
                          <span>+ Create New Custom Badge</span>
                      </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allAvailableAchievements.map(ach => {
                          const hasBadge = userAchievements[managingBadgesStudent.id]?.includes(ach.id);
                          const isCustom = ach.id.startsWith('custom_');
                          return (
                              <div 
                                key={ach.id} 
                                onClick={() => handleToggleAchievement(managingBadgesStudent.id, ach.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${hasBadge ? 'bg-yellow-50 border-yellow-400 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300 opacity-75 hover:opacity-100'}`}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-full ${hasBadge ? 'bg-yellow-200 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}>
                                          {renderIcon(ach.icon, "w-6 h-6")}
                                      </div>
                                      <div>
                                          <h4 className={`font-bold ${hasBadge ? 'text-gray-800' : 'text-gray-500'}`}>{ach.title}</h4>
                                          <p className="text-xs text-gray-400">{ach.description}</p>
                                          {isCustom && <span className="text-[10px] uppercase bg-purple-100 text-purple-600 px-1 rounded font-bold">Custom</span>}
                                      </div>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${hasBadge ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                      {hasBadge && <CheckIcon className="w-4 h-4" />}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
           </div>
      )}
    </>
  );
};

export default TeacherDashboard;
