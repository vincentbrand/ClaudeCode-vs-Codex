# Claude Code vs Codex

I had a fun experiment; Claude Code vs Codex.

So yes, Anthropic kind of leads the way. MCP, terminal use, and the list goes on, it all comes from them. Plugins and skills in Claude Code are awesome features. They really innovate, and they are good at it. But for a long time Claude is claimed to be better in coding tasks. Yes it is good, but I see it more and more often that when I question the results of Claude, ChatGPT or Gemini can generate proper code.


To put things to the test; i used the "code-simplifier" plugin from Claude. I had a class that worked great made by codex and took 174 lines. After simplifying it with claude it turned  into a 225 line monster file. One could say that the code wasnt written clearly and it needed more explanation, and Claude did its job, but fact is that a 30% increase in code is hard to justify.


So to take it even further I added both files in a repo, and asked both Codex and Claude to evaluate which file is better. Surpringly; even Codex thinks the Claude file is better, even though it has 30% more lines.

Check out the repo for the exact differences:


What combinations do you use in your flow? 


PS. I don't vibe code, I supervise agents



## Prompt to Compare

Codex

```create a new file called CodexCompare.md analyse the color.js file in both folders. then in the CodexCompare.md create a clear list of differences, grade the quality of the files and add a breakdown of which file is better and why. ```

Claude Code

```create a new file called ClaudeCompare.md analyse the color.js file in both folders. then in the ClaudeCompare.md create a clear list of differences, grade the quality of the files and add a breakdown of which file is better and why. ```

