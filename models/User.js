module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    token: DataTypes.STRING,
    tally: DataTypes.INTEGER,
  });

  return User;
};
