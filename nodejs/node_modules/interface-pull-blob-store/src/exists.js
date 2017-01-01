/* eslint-env mocha */
'use strict'

const pull = require('pull-stream')
const expect = require('chai').expect

module.exports = (common) => {
  let store

  beforeEach((done) => {
    common.setup((err, _store) => {
      if (err) return done(err)
      store = _store
      done()
    })
  })

  afterEach((done) => {
    common.teardown(store, done)
  })

  describe('exists', () => {
    it('returns true for existing key', (done) => {
      pull(
        pull.values([new Buffer('hello')]),
        store.write('cool', (err) => {
          expect(err).to.not.exist

          store.exists('cool', (err, exists) => {
            expect(err).to.not.exist
            expect(exists).to.be.eql(true)
            done()
          })
        })
      )
    })

    it('returns false for a non existing key', (done) => {
      store.exists('fail', (err, exists) => {
        expect(err).to.not.exist
        expect(exists).to.be.eql(false)
        done()
      })
    })

    it('missing key - cb error', (done) => {
      store.exists(null, (err) => {
        expect(err).to.exist
        done()
      })
    })

    it('missing cb - no error', () => {
      expect(
        () => store.exists()
      ).to.not.throw()
    })
  })
}
