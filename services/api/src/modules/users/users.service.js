function getProfile(user) {
  return {
    id: user.id,
    roleId: user.roleId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    status: user.status
  };
}

module.exports = {
  getProfile
};
