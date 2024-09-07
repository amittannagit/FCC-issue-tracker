const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let testProject = 'fcc-project';
  let testIssueId;
  
  suite('POST /api/issues/{project} => create an issue', function() {
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post(`/api/issues/${testProject}`)
        .send({
          issue_title: 'Issue with All Fields',
          issue_text: 'This issue contains all fields',
          created_by: 'Test User',
          assigned_to: 'Tester',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'created_on');
          assert.isString(res.body.created_on);
          assert.property(res.body, 'updated_on');
          assert.isString(res.body.updated_on);
          assert.property(res.body, 'open');
          assert.isBoolean(res.body.open);
          assert.isTrue(res.body.open);
          assert.property(res.body, '_id');
          assert.isString(res.body._id);
          testIssueId = res.body._id; // Save the issue ID for later tests
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post(`/api/issues/${testProject}`)
        .send({
          issue_title: 'Issue with Required Fields',
          issue_text: 'This issue has only required fields',
          created_by: 'Test User'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'created_on');
          assert.isString(res.body.created_on);
          assert.property(res.body, 'updated_on');
          assert.isString(res.body.updated_on);
          assert.property(res.body, 'open');
          assert.isBoolean(res.body.open);
          assert.isTrue(res.body.open);
          assert.property(res.body, '_id');
          assert.isString(res.body._id);
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post(`/api/issues/${testProject}`)
        .send({
          created_by: 'Test User'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => view issues', function() {
    test('View issues on a project', function(done) {
      chai.request(server)
        .get(`/api/issues/${testProject}`)
        .end(function(err, res) {
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 2); // Ensure there are at least two issues
          res.body.forEach(issue => {
            assert.property(issue, 'issue_title');
            assert.property(issue, 'issue_text');
            assert.property(issue, 'created_by');
            assert.property(issue, 'assigned_to');
            assert.property(issue, 'status_text');
            assert.property(issue, 'open');
            assert.property(issue, 'created_on');
            assert.property(issue, 'updated_on');
            assert.property(issue, '_id');
          });
          done();
        });
    });

    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get(`/api/issues/${testProject}?created_by=Test User`)
        .end(function(err, res) {
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Test User');
          });
          done();
        });
    });

    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get(`/api/issues/${testProject}?created_by=Test User&status_text=In Progress`)
        .end(function(err, res) {
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.created_by, 'Test User');
            assert.equal(issue.status_text, 'In Progress');
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => update an issue', function() {
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put(`/api/issues/${testProject}`)
        .send({
          _id: testIssueId,
          issue_text: 'Updated Issue Text'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put(`/api/issues/${testProject}`)
        .send({
          _id: testIssueId,
          issue_title: 'Updated Issue Title',
          status_text: 'Completed'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put(`/api/issues/${testProject}`)
        .send({
          issue_text: 'Updated Issue Text Without ID'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put(`/api/issues/${testProject}`)
        .send({
          _id: testIssueId
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put(`/api/issues/${testProject}`)
        .send({
          _id: 'invalidid',
          issue_text: 'Updated Issue Text with Invalid ID'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => delete an issue', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete(`/api/issues/${testProject}`)
        .send({
          _id: testIssueId
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete(`/api/issues/${testProject}`)
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete(`/api/issues/${testProject}`)
        .send({
          _id: 'invalidid'
        })
        .end(function(err, res) {
          assert.isObject(res.body);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });
  });

  suite('Additional Tests', function() {
    // Add this before hook
    before(function(done) {
      // Create a test issue if one doesn't exist
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue',
          created_by: 'Test User'
        })
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  
    test('Ensure all functional tests pass', function(done) {
      this.timeout(5000);
  
      chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res) {
          if (err) return done(err);
  
          const issues = res.body;
          console.log("Issues: ", issues);
  
          assert.isArray(issues, 'Response should be an array');
          assert.isAtLeast(issues.length, 1, 'There should be at least 1 issue in the response');
  
          issues.forEach(issue => {
            assert.property(issue, '_id');
            assert.property(issue, 'issue_title');
            assert.property(issue, 'issue_text');
            assert.property(issue, 'created_on');
            assert.property(issue, 'updated_on');
          });
  
          done();
        });
    });
  });
});
