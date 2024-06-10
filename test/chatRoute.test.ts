import { expect } from 'chai'
import chai from 'chai'
import chaiHttp from 'chai-http'
import sinon from 'sinon'
import path from 'path'
import express, { Application } from 'express'
import router from '../src/routes/chatRoute'

chai.use(chaiHttp)

describe('GET /', () => {
  let app: Application

  before(() => {
    app = express()
    app.use('/', router)
  })

  it('should serve the chart.html file', (done) => {
    chai
      .request(app)
      .get('/')
      .end((err, res) => {
        if (err) return done(err)
        expect(res).to.have.status(200)
        expect(res).to.be.html
        // Check if the response contains a known part of your HTML file
        // expect(res.text).to.include('<!DOCTYPE html>') // Adjust this line as per your actual HTML content
        done()
      })
  })
})
