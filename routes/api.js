const mongoose = require('mongoose');
const Issue = require('../models/Issue'); // Import your Issue model

module.exports = function (app) {

  // Route for handling the issues of a specific project
  app.route('/api/issues/:project')

    // GET: Fetch all issues (optionally filtered by query params)
    .get(async function (req, res) {
      const project = req.params.project;
      const filter = req.query; // Optional filters (e.g. status, created_by)

      try {
        const issues = await Issue.find({ project, ...filter }).exec();
        res.json(issues.length ? issues : []); // Always return an array
      } catch (err) {
        res.status(500).json({ error: 'An error occurred', message: err.message });
      }
    })

    // POST: Create a new issue
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      // Ensure required fields are present
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      // Create a new issue object
      const newIssue = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      });

      try {
        const issue = await newIssue.save();
        res.json(issue); // Return the created issue
      } catch (err) {
        res.status(500).json({ error: 'An error occurred', message: err.message });
      }
    })

    // PUT: Update an existing issue
    .put(async function (req, res) {
      const { _id, ...updateFields } = req.body;
  
      // Ensure _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
  
      // Ensure there are fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
  
      // Check if _id is a valid MongoDB ObjectId
      if (!mongoose.isValidObjectId(_id)) {
        return res.json({ error: 'could not update' });
      }
  
      try {
        const issue = await Issue.findByIdAndUpdate(
          _id, 
          { ...updateFields, updated_on: new Date() }, 
          { new: true }
        ).exec();
  
        // If no issue is found with the provided _id
        if (!issue) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'An error occurred', message: err.message });
      }
    })

    // DELETE: Delete an existing issue
    .delete(async function (req, res) {
      const { _id } = req.body;

      // Ensure _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Check if _id is a valid MongoDB ObjectId
      if (!mongoose.isValidObjectId(_id)) {
        return res.json({ error: 'could not delete' });
      }

      try {
        const issue = await Issue.findByIdAndDelete(_id).exec();
        if (!issue) return res.json({ error: 'could not delete', _id });
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.status(500).json({ error: 'An error occurred', message: err.message });
      }
    });
};
