import { useState } from 'react';
import { FiX, FiUserPlus, FiTrash2, FiUser, FiMail, FiShield } from 'react-icons/fi';
import { useTeam } from '../contexts/TeamContext';

export default function TeamSettingsModal({ onClose, onInvite }) {
    const { members, removeMember } = useTeam();

    const handleRemoveMember = async (id) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            try {
                await removeMember(id);
            } catch (error) {
                alert('Failed to remove member: ' + error.message);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
            <div className="glass rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 glass border-b border-dark-700 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-dark-50">Team Settings</h2>
                        <p className="text-dark-400 text-sm">Manage your team members and assignees</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-dark-400 hover:text-dark-100 transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Invite Action */}
                    <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-dark-100 mb-1">Grow Your Team</h3>
                            <p className="text-dark-400 text-sm">Invite colleagues to collaborate on this board.</p>
                        </div>
                        <button
                            onClick={onInvite}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <FiUserPlus className="w-5 h-5" />
                            Invite People
                        </button>
                    </div>

                    {/* Team List */}
                    <div>
                        <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
                            <FiShield className="w-5 h-5 text-secondary-400" />
                            Team Members ({members.length})
                        </h3>
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 bg-dark-800 rounded-lg border border-dark-700 hover:border-dark-600 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full" />
                                            ) : (
                                                member.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-dark-100 flex items-center gap-2">
                                                {member.name}
                                                {member.isCurrentUser && (
                                                    <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </h4>
                                            <p className="text-sm text-dark-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs px-3 py-1 rounded-full ${member.role === 'Owner' || member.role === 'Admin'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-dark-700 text-dark-300'
                                            }`}>
                                            {member.role}
                                        </span>
                                        {!member.isCurrentUser && (
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="text-dark-500 hover:text-red-400 transition-colors p-2"
                                                title="Remove member"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
