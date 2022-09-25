'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('user', { 
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      name: {
          type: Sequelize.STRING
      },
      email: {
          type: Sequelize.STRING
      },
      contact_no: {
          type: Sequelize.STRING
      },
      dob: {
          type: Sequelize.DATEONLY
      },
      city: {
          type: Sequelize.STRING
      },
      state: {
          type: Sequelize.STRING
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
