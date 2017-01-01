/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const pull = require('pull-stream')

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

  describe('read-write', () => {
    it('writes the content to disk', (done) => {
      pull(
        pull.values([new Buffer('hello'), new Buffer('world')]),
        store.write('first', read)
      )

      function read (err) {
        expect(err).to.not.exist
        pull(
          store.read('first'),
          pull.collect((err, res) => {
            expect(err).to.not.exist
            expect(Buffer.concat(res)).to.have.length(10)
            done()
          })
        )
      }
    })

    it('errors when reading missing key', (done) => {
      pull(
        store.read('missing'),
        pull.onEnd((err) => {
          expect(err).to.exist
          done()
        })
      )
    })

    describe('parameters', () => {
      it('write - missing key - cb errors', (done) => {
        store.write(null, (err) => {
          expect(err).to.exist
          done()
        })
      })

      it('read - missing key - pull error', (done) => {
        pull(
          store.read(),
          pull.onEnd((err) => {
            expect(err).to.exist
            done()
          })
        )
      })

      it('cb is optional', (done) => {
        pull(
          pull.values([new Buffer('woot')]),
          store.write('hi')
        )

        // give it some time to finish the write
        setTimeout(validateWrite, 200)
        function validateWrite () {
          pull(
            store.read('hi'),
            pull.collect((err, data) => {
              expect(err).to.not.exist
              expect(data).to.be.eql([new Buffer('woot')])
              done()
            })
          )
        }
      })
    })
  })
}
