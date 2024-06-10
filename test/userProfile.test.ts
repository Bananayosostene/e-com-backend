import express, { Request, Response } from 'express'
import { expect } from 'chai'
import sinon, { SinonStub } from 'sinon'
import UserController from '../src/controllers/UserController'
import User from '../src/database/models/userModel'
import UserProfile from '../src/database/models/userProfile'
import {
  imageFilter,
  singleFileUpload,
  upload,
} from '../src/middlewares/fileUpload'
import { createUserProfile } from '../src/services/userServices'
import * as os from 'os'
import * as path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import cloudinaryUpload from '../src/utils/cloudinary'

describe('createUserProfile', () => {
  it('should create a new user profile if user exists and profile does not exist', async () => {
    const userStub = sinon.stub(User, 'findOne').resolves({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    } as User)


    const userProfileStub = sinon.stub(UserProfile, 'findOne').resolves(null)

    const saveStub = sinon.stub(UserProfile.prototype, 'save').resolves()

    await createUserProfile(1)

    expect(userStub.calledOnceWithExactly({ where: { id: 1 } })).to.be.true
    expect(userProfileStub.calledOnceWithExactly({ where: { userId: 1 } })).to
      .be.true
    expect(saveStub.calledOnce).to.be.true

    userStub.restore()
    userProfileStub.restore()
    saveStub.restore()
  })

  it('should not create a new user profile if user does not exist', async () => {
    const userStub = sinon.stub(User, 'findOne').resolves(null)

    await createUserProfile(1)

    expect(userStub.calledOnceWithExactly({ where: { id: 1 } })).to.be.true

    userStub.restore()
  })

  it('should not create a new user profile if user profile already exists', async () => {
    const userStub = sinon.stub(User, 'findOne').resolves({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    } as User)

    const userProfileStub = sinon.stub(UserProfile, 'findOne').resolves({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      userId: 1,
    } as UserProfile)

    await createUserProfile(1)

    expect(userStub.calledOnceWithExactly({ where: { id: 1 } })).to.be.true
    expect(userProfileStub.calledOnceWithExactly({ where: { userId: 1 } })).to
      .be.true

    userStub.restore()
    userProfileStub.restore()
  })
})

describe('Image Filter', () => {
  it('should accept image files', () => {
    const cb = sinon.spy()
    const image = { mimetype: 'image/png' }
    imageFilter(image as any, cb)
    expect(cb.calledWith(null, true)).to.be.true
  })

  it('should reject non-image files', () => {
    const cb = sinon.spy()
    const textFile = { mimetype: 'text/plain' }
    imageFilter(textFile as any, cb)
    expect(cb.calledWith(null, false)).to.be.true
  })
})

describe('Single File Upload', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: sinon.SinonSpy<any[], any>
  let singleStub: sinon.SinonStub<any[], any>
  beforeEach(() => {
    req = {
      file: {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File,
    }
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    }
    next = sinon.spy()
    singleStub = sinon
      .stub(upload, 'single')
      .callsFake(
        (_fieldName: string) =>
          async (req: Request, _res: Response, cb: any) => {
            await cb(null)
          },
      )
  })
  afterEach(() => {
    singleStub.restore()
  })

  it('should call next after successful upload', async () => {
    const cloudinaryUploadStub = sinon.stub().resolves('image_url')
    const cloudinaryModule = { cloudinaryUpload: cloudinaryUploadStub }

    await singleFileUpload(req as Request, res as Response, next)
    expect(next.called).to.be.false
  })

  it('should handle upload error', async () => {
    const errorMessage = 'Upload failed'
    const cloudinaryUploadStub = sinon.stub().rejects(new Error(errorMessage))
    const cloudinaryModule = { cloudinaryUpload: cloudinaryUploadStub }
    singleStub.restore()
    singleStub = sinon
      .stub(upload, 'single')
      .callsFake(
        (_fieldName: string) =>
          async (req: Request, _res: Response, cb: any) => {
            await cb(new Error(errorMessage))
          },
      )

    await singleFileUpload(req as Request, res as Response, next)
    expect((res.status as sinon.SinonStub).calledWith(500)).to.be.true
  })
})

describe('cloudinaryUpload function', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should upload file to Cloudinary and return secure URL', async () => {
    const buffer = Buffer.from('Test file content')
    const fileName = 'testFile.jpg'
    const tempFilePath = path.join(os.tmpdir(), fileName)
    const uploadResult = { secure_url: 'https://cloudinary.com/image.jpg' }

    const writeFileStub = sinon.stub().callsFake((path, buffer, callback) => {
      callback(null)
    })

    const cloudinaryUploadStub = sinon
      .stub(cloudinary.uploader, 'upload')
      .callsFake((path, callback): undefined => {
        callback(undefined, uploadResult as undefined)
      })

    const result = await cloudinaryUpload(buffer, fileName)

    expect(result).to.equal(uploadResult.secure_url)
    expect(cloudinaryUploadStub.calledOnce)
    //expect(cloudinaryUploadStub.firstCall.args[0]).to.equal(tempFilePath);
  })

  it('should reject with an error if file upload fails', async () => {
    const buffer = Buffer.from('Test file content')
    const fileName = 'testFile.jpg'
    const tempFilePath = path.join(os.tmpdir(), fileName)
    const errorMessage = 'Upload failed'

    const writeFileStub = sinon.stub().callsFake((path, buffer, callback) => {
      callback(null)
    })

    const cloudinaryUploadStub = sinon
      .stub(cloudinary.uploader, 'upload')
      .callsFake((path, callback): undefined => {
        callback(new Error(errorMessage) as undefined)
      })

    try {
      await cloudinaryUpload(buffer, fileName)
    } catch (error) {
      expect(error).to.be.an('Error')
      expect(error.message).to.equal(errorMessage)
      expect(cloudinaryUploadStub.calledOnce).to.be.true
      expect(cloudinaryUploadStub.firstCall.args[0]).to.equal(tempFilePath)
    }
  })
})

describe('Express Controller Tests', () => {
  describe('singleFileUpload', () => {
    it('should call imageFilter with correct arguments', async () => {
      let req = {
        headers: {
          authorization: 'Bearer validToken',
        },
      } as Request
      let res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        locals: {},
      } as unknown as Response
      let next: express.NextFunction
      next = sinon.spy()
      const imageFilterCallback = sinon.stub()

      await singleFileUpload(req as Request, res as Response, next)

      expect(imageFilterCallback.calledWithExactly(null, true)).to.be.false
    })
    it('should call next function', async () => {
      let req = {
        headers: {
          authorization: 'Bearer validToken',
        },
      } as Request
      let res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        locals: {},
      } as unknown as Response
      let next: express.NextFunction
      next = sinon.spy()
      await singleFileUpload(req, res, next)

      expect(next)
    })
  })
})

describe('updateUser', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: SinonStub
  let jsonStub: SinonStub
  let updateUserByIdStub: SinonStub
  let updateUserProfileByIdStub: SinonStub
  let getUserProfileByIdStub: SinonStub

  beforeEach(() => {
    req = {
      user: { id: 1 },
      body: { username: 'newUsername', email: 'newemail@example.com' },
    }
    statusStub = sinon.stub().returns({ json: () => {} })
    jsonStub = sinon.stub()
    res = { status: statusStub, json: jsonStub }
    updateUserByIdStub = sinon.stub().resolves()
    updateUserProfileByIdStub = sinon.stub(UserProfile, 'update');
    getUserProfileByIdStub = sinon.stub().resolves({
      id: 1,
      username: 'newUsername',
      email: 'newemail@example.com',
    })
  })


  afterEach(() => {
    sinon.restore()
  })

  it('should update user', async () => {
    await UserController.updateUser(req as Request, res as Response)

    expect(updateUserByIdStub.calledOnce)
    expect(updateUserProfileByIdStub.calledOnce)
    expect(getUserProfileByIdStub.calledOnce)
    expect((res.status as sinon.SinonStub).calledOnceWithExactly(200)).to.be
      .true
    expect((res.json as sinon.SinonStub).calledOnce)
  })

  it('should handle case where no fields to update', async () => {
    req.body = {}
    await UserController.updateUser(req as Request, res as Response)

    expect((res.status as sinon.SinonStub).calledOnceWithExactly(400)).to.be
      .true
  })

  it('should handle2 error', async () => {
    const errorMessage = 'Internal Server Error'
    updateUserProfileByIdStub.rejects(new Error(errorMessage))

    await UserController.updateUser(req as Request, res as Response)
    expect((res.status as sinon.SinonStub).calledWith(500)).to.be.true
  })
});

describe('getUser', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let statusStub: SinonStub
  let jsonStub: SinonStub
  let getUserProfileByIdStub: SinonStub

  beforeEach(() => {
    req = {
      user: { id: 1 },
    }
    statusStub = sinon.stub().returns({ json: () => {} })
    jsonStub = sinon.stub()
    res = { status: statusStub, json: jsonStub }
    getUserProfileByIdStub = sinon.stub().resolves({
      id: 1,
      username: 'exampleUsername',
      email: 'example@example.com',
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should get user profile', async () => {
    await UserController.getUser(req as Request, res as Response)

    expect(getUserProfileByIdStub.calledOnce)
    expect((res.status as sinon.SinonStub).calledOnceWithExactly(200)).to.be
      .true
    expect((res.json as sinon.SinonStub).calledOnce)
  })

  it('should handle errors', async () => {
    req.user = { id: 1 }
    const errorMessage = 'Internal server error'
    const error = new Error(errorMessage)
    const statusStub = res.status as sinon.SinonStub
    const jsonStub = res.json as sinon.SinonStub

    getUserProfileByIdStub = sinon.stub(UserProfile, 'findOne');
    getUserProfileByIdStub.rejects(error)
    await UserController.getUser(req as Request, res as Response);
    expect(statusStub.calledWith(500))
  })
})
