// NCLTestApp.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include <ncl.h>
#include <windows.h>
#include <fstream>

//std::ofstream fileStream("W:\\log.txt");

bool gNclInitialized=false;
int gAgreementHandle;
std::vector<NclProvision> gProvisions; // the allowed provisions


void sendMsgToChrome (std::string msg, std::string target){
	//std::stringstream ss;
	//ss << "{\"text\": \"" << msg << "\"}";
	//std::string message = ss.str();

	std::string message = "{\"target\": \"" + target + "\", \"text\": \"" + msg + "\"}";

	unsigned int len = message.length();
    // We need to send the 4 bytes of length information
    std::cout << char(((len>>0) & 0xFF))
              << char(((len>>8) & 0xFF))
              << char(((len>>16) & 0xFF))
              << char(((len>>24) & 0xFF));
    // Now we can output our message
    std::cout << message;
}

void callback(NclEvent event, void* userData){

	std::string led_pattern = "";
    switch(event.type){
        case NCL_EVENT_INIT:
			sendMsgToChrome("NCL_EVENT_INIT passed to callback", "console");
            if(event.outcome.success) gNclInitialized=true;
            else exit(-1);
            break;
        case NCL_EVENT_DISCOVERY:
			sendMsgToChrome("NCL_EVENT_DISCOVERY passed to callback", "console");
            sendMsgToChrome("Nymi discovered", "user");
            sendMsgToChrome("Stopping scan", "console");
            nclStopScan();
            sendMsgToChrome("Agreeing", "console");
            nclAgree(event.discovery.nymiHandle);
            break;
        case NCL_EVENT_AGREEMENT:
			sendMsgToChrome("NCL_EVENT_AGREEMENT passed to callback", "console");
            gAgreementHandle=event.agreement.nymiHandle;
            sendMsgToChrome("Is this: ", "user");
            for(unsigned i=0; i<NCL_LEDS; ++i){
				std::string led_char = event.agreement.leds[i]?"1":"0";
                led_pattern = led_pattern + led_char;
			}
			sendMsgToChrome(led_pattern, "user");
            sendMsgToChrome(" the correct LED pattern (agree/reject)?", "user");
            break;
        case NCL_EVENT_PROVISION:
			sendMsgToChrome("NCL_EVENT_PROVISION passed to callback", "console");
            gProvisions.push_back(event.provision.provision);
            sendMsgToChrome("provisioned completed", "user");
            break;
        case NCL_EVENT_DISCONNECTION:
			sendMsgToChrome("NCL_EVENT_DISCONNECTION passed to callback", "console");
            sendMsgToChrome("disconnected", "console");
            break;
        case NCL_EVENT_FIND:
			sendMsgToChrome("NCL_EVENT_FIND passed to callback", "console");
            sendMsgToChrome("Nymi found", "console");
            sendMsgToChrome("Stopping scan", "console");
            nclStopScan();
            sendMsgToChrome("Validating the Nymi...", "user");
            nclValidate(event.find.nymiHandle);
            break;
        case NCL_EVENT_VALIDATION:
			sendMsgToChrome("NCL_EVENT_VALIDATION passed to callback", "console");
            sendMsgToChrome("VALIDATED", "user");
			break;
		case NCL_EVENT_SCAN_START:
			sendMsgToChrome("NCL_EVENT_SCAN_START passed to callback", "console");
			sendMsgToChrome((event.outcome.success?"success":"failure"), "console");
            break;
        default: break;
    }
}


std::string getMsgFromChrome(){
	unsigned int c, i, t=0;
    std::string inp;  
    bool bCommunicationEnds = false;

        inp="";
        t=0;
        // Sum the first 4 chars from stdin (the length of the message passed).
        for (i = 0; i <= 3; i++) {
            t += getchar();
        }

        // Loop getchar to pull in the message until we reach the total
        //  length provided.

		std::stringstream ss;
		ss << t;
		std::string str = ss.str();
		//sendMsgToChrome("t is" );
		//sendMsgToChrome(str);
		
        for (i=0; i < t; i++) {
            c = getchar();
            if(c == EOF)
            {
                bCommunicationEnds = true;
                i = t;
            }
            else
            {
                inp += c;
            }
        }

        //if(!bCommunicationEnds)
        //{
        //    unsigned int len = inp.length();
        //    // We need to send the 4 btyes of length information
        //    std::cout << char(((len>>0) & 0xFF))
        //        << char(((len>>8) & 0xFF))
        //        << char(((len>>16) & 0xFF))
        //        << char(((len>>24) & 0xFF));
        //    // Now we can output our message
        //    std::cout << inp;
        //}

	sendMsgToChrome("native app got message: "+ inp, "console");
	return inp;
}

int _tmain(int argc, _TCHAR* argv[])
{
	std::cout.setf( std::ios_base::unitbuf ); //instead of "<< eof" and "flushall"

	sendMsgToChrome("type 'setup' if you are using a new Nymi, or 'authenticate' if you are a returning user.", "user");

	if(!nclInit(callback, NULL, "Chrome", NCL_FALSE, stderr)){
		sendMsgToChrome("The Nymi Communication Library failed to run", "user");
		return -1;
	}
	//sendMsgToChrome("before while loop");
	//fileStream<<"lolol\n"<<std::flush;
	while(true){
       std::string input = getMsgFromChrome();

	   //fileStream<<"got input:"+input+"\n"<<std::flush;

	   //sendMsgToChrome("exited getMsgFromChrome()");
	   
       if(!gNclInitialized){
		   //fileStream<<"NCL not initialized"<<std::flush;
           sendMsgToChrome("NCL didn't finished initializing yet, please wait.", "user");
           continue;
       }
       else if(input=="\"setup\""){
		   //fileStream<<"got to discover clause"<<std::flush;
           sendMsgToChrome("starting discovery", "console");
           NclBool result = nclStartDiscovery();
		   //sendMsgToChrome(result.str());
		   sendMsgToChrome(" done discovery", "console");
       }
       else if(input=="\"agree\""){
           sendMsgToChrome("provisioning", "console");
           nclProvision(gAgreementHandle);
		   sendMsgToChrome("done provisioning", "console");
       }
       else if(input=="\"reject\""){
           sendMsgToChrome("disconnecting", "console");
           nclDisconnect(gAgreementHandle);
		   sendMsgToChrome("done disconnecting", "console");
       }
       else if(input=="\"authenticate\""){
           sendMsgToChrome("starting finding", "console");
           nclStartFinding(gProvisions.data(), gProvisions.size());
		   sendMsgToChrome("done finding", "console");
       }
       else if(input=="\"quit\""){ 
		   sendMsgToChrome("program quitting", "console");
		   break;
	   }
	   else{
		   //fileStream<<"got to else clause"<<std::flush;
		   sendMsgToChrome("invalid input, please type 'setup', 'authenticate', or 'quit'", "user");
		   continue;
	   }
   }
   //finish
   //sendMsgToChrome("after while loop");
   nclFinish();

	return 0;

}

