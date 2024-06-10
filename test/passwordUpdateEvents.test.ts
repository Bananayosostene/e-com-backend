import { expect } from 'chai';
import sinon, { SinonStub } from 'sinon';
import userEvents from '../src/utils/passwordUpdateEvent';
import cron from 'node-cron';
import User from '../src/database/models/userModel';
import { FindOptions, Model, UpdateOptions } from 'sequelize';
import { passwordExpiryCron,notifyUser } from '../src/utils/passwordUpdateEvent';
import logger from '../src/utils/logger';
import sendMail from '../src/utils/sendEmail'
describe('passwordExpiryCron', () => {
    let cronScheduleStub: sinon.SinonStub;
    let userFindAllStub: sinon.SinonStub;
    let userUpdateStub: sinon.SinonStub;
    // let notifyUserStub: sinon.SinonStub;
    let loggerErrorStub: sinon.SinonStub;
  
    beforeEach(() => {
      cronScheduleStub = sinon.stub(cron, 'schedule');
      userFindAllStub = sinon.stub(User, 'findAll');
      userUpdateStub = sinon.stub(User, 'update');
      loggerErrorStub = sinon.stub(logger, 'error');
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should schedule a cron job and handle password expirations', async () => {
      const mockUsers = [
        { id: 1, lastTimePasswordUpdate: new Date(), isExpired: false },
        { id: 2, lastTimePasswordUpdate: new Date(), isExpired: false },
      ];
      userFindAllStub.resolves(mockUsers);
      userUpdateStub.resolves([1]);
  
      passwordExpiryCron();
  
      expect(cronScheduleStub.calledOnce).to.be.true;
      const cronFunction = cronScheduleStub.firstCall.args[1];
      await cronFunction();
  
      expect(userFindAllStub.calledOnce).to.be.true;
      expect(userUpdateStub.calledTwice).to.be.true;
    });
  
    it('should log an error if something goes wrong', async () => {
      const error = new Error('Something went wrong');
      userFindAllStub.rejects(error);
  
      passwordExpiryCron();
  
      const cronFunction = cronScheduleStub.firstCall.args[1];
      await cronFunction();
  
      expect(loggerErrorStub.calledWith('Error running password expiry cron job:', error)).to.be.true;
    });
  });
describe('passwordUpdated event', () => {
  let userUpdateStub: sinon.SinonStub<[values: { [x: string]: any; }, options: UpdateOptions<any>], Promise<[affectedCount: number]>>;

  beforeEach(() => {
    userUpdateStub = sinon.stub(User, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update the password update time and reset isExpired flag', async () => {
    userUpdateStub.resolves([1]);

    userEvents.emit('passwordUpdated', 1);

    await new Promise(process.nextTick); // wait for the event handler to finish

    expect(userUpdateStub.calledOnce).to.be.true;
    expect(
      userUpdateStub.calledWith(
        { lastTimePasswordUpdate: sinon.match.date, isExpired: false },
        { where: { id: 1 } },
      ),
    ).to.be.true;
  });

  it('should log an error if updating fails', async () => {
    const error = new Error('Something went wrong');
    userUpdateStub.rejects(error);
    const consoleErrorStub = sinon.stub(console, 'error');

    userEvents.emit('passwordUpdated', 1);

    await new Promise(process.nextTick); // wait for the event handler to finish

    expect(consoleErrorStub.calledWith(`Failed to update password update time for user 1:`, error)).to.be.true;
  });
});
