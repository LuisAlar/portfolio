# The process

1. Document loads into a folder --> Automatic data extraction
		*Data that's extracted should be stored in SharePoint list FIRST*
2. Extracted Data (from agent) --> Word document to specific SharePoint folder 
		*Doc will use "[doctitle]-[report]-[date]" format*
3. Error logs are stored into spreadsheet ( depending on schema, SP List may be better approach)
		No python required, P.A allows this
4. Email sent when process completed to: User, Manager, Admin
5. Delete File
## Questions & Suggestions
- will the uploaded documents have a specific schema that's **consistent**?
- Is the information on the documents going to be consistent 
	- or do we want this to be a "general" workflow that takes in *any* document
- What will the error log contain?

## Response to your questions 

**Are there limitations on PA and SPO**?
One Team can have access to an SPO folder that can therefore  connected to the PA flows we will build. 
Extracting info from a word doc in PA has its limitations. Currently I'm having to extract the XML files from Worddocs and read the info from those files. ( I will have premium access to extract info directly through word soon, which could eliminate this current process ). 
Other than that, PA and SPO work great for this use case.

**What are alternative for this**?
I would say, most of the process you have described can be done all through Power Automate. Power Automate can:
- Listen for a new uploaded document in a folder 
- call agent to analyze document
- CRUD SharePoint items, folders, docs etc.
- Send out emails to notify stakeholders
Python scripts will be useful when trying to compute and analyze complex data sets, obtained via the docs or error logs . We will need a well define schema of the data before a script can be ran ( in my opinion). As for changing file names, moving files, ect, PA handles this well.





