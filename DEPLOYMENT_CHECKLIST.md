# 🚀 Deployment Checklist

Use this checklist to ensure your deployment is successful.

## ✅ Pre-Deployment

### Nhost Backend
- [ ] Nhost project created and configured
- [ ] Database tables created (`chats`, `messages`)
- [ ] Hasura permissions configured for both tables
- [ ] Authentication enabled in Nhost
- [ ] GraphQL endpoint accessible

### Code Preparation
- [ ] All TypeScript errors resolved
- [ ] Build runs successfully locally (`npm run build`)
- [ ] Environment variables documented
- [ ] Git repository up to date

### Testing
- [ ] Authentication works locally
- [ ] Chat creation and messaging work
- [ ] Real-time subscriptions functional
- [ ] No console errors in browser

## 🌐 Netlify Deployment

### Repository Setup
- [ ] Code pushed to GitHub
- [ ] Repository is public or Netlify has access
- [ ] Main branch contains latest code

### Netlify Configuration
- [ ] Site created from Git repository
- [ ] Build settings configured:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: `18`
- [ ] Environment variables added:
  - `VITE_NHOST_SUBDOMAIN`
  - `VITE_NHOST_REGION`
  - `VITE_HASURA_GRAPHQL_URL`

### Build Process
- [ ] First build completes successfully
- [ ] No build errors in Netlify logs
- [ ] Site preview loads without errors

## 🧪 Post-Deployment Testing

### Basic Functionality
- [ ] Site loads at Netlify URL
- [ ] Authentication pages render correctly
- [ ] Can sign up with new account
- [ ] Can log in with existing account
- [ ] Redirects work properly after auth

### Chat Features
- [ ] Can create new chats
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Chat list updates correctly
- [ ] No GraphQL errors in browser console

### Performance
- [ ] Page loads quickly (< 3 seconds)
- [ ] No JavaScript errors
- [ ] Real-time updates work smoothly
- [ ] Mobile responsive design works

## 🔧 Troubleshooting

### Build Failures
```bash
# Common issues:
- TypeScript compilation errors
- Missing dependencies
- Environment variable issues
- Node version mismatch
```

### Runtime Issues
```bash
# Check these:
- Network tab for failed requests
- Console for JavaScript errors
- Nhost project status
- Environment variable values
```

### Authentication Problems
```bash
# Verify:
- Nhost subdomain is correct
- Region matches your project
- GraphQL URL is accessible
- Hasura permissions are set
```

## 📈 Performance Optimization

### After Successful Deployment
- [ ] Enable Netlify Analytics
- [ ] Set up error monitoring
- [ ] Configure custom domain (optional)
- [ ] Enable branch deploys for testing

### Monitoring
- [ ] Check Core Web Vitals
- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Set up uptime monitoring

## 🎯 Success Criteria

Your deployment is successful when:

✅ **Build**: Completes without errors  
✅ **Load**: Site loads in < 3 seconds  
✅ **Auth**: Sign up/login works  
✅ **Chat**: Can create chats and send messages  
✅ **Real-time**: Messages update instantly  
✅ **Mobile**: Works on mobile devices  
✅ **Errors**: No console errors  

## 📞 Support

If you encounter issues:

1. **Check Netlify build logs** for specific errors
2. **Verify environment variables** match your Nhost project
3. **Test locally** with production environment variables
4. **Check Nhost status** at status.nhost.io
5. **Review Hasura permissions** in the console

---

**Ready to deploy?** Work through this checklist step by step! 🚀